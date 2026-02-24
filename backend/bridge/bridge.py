import serial
import socket
import os
import struct
import numpy as np
import tensorflow as tf
import scipy.signal as sig
from scipy.fft import fft, fftfreq
from collections import deque

# --- CONFIGURATION ---
SERIAL_PORT = "COM8"  
UDP_IP = "127.0.0.1"  
UDP_PORT = 8001       

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_RESP_TFLITE = os.path.join(BASE_DIR, 'model_resp.tflite')
PATH_HAR_TFLITE = os.path.join(BASE_DIR, 'model_har.tflite')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# ==========================================
# PRE-CALCULS MATHÉMATIQUES
# ==========================================
FS = 50.0

# 1. Filtre HAR
nyq = 0.5 * FS
b_band, a_band = sig.butter(4, [0.75 / nyq, 5.0 / nyq], btype='band')

# 2. Masque FFT Respiration
N_POINTS_FFT = 1500
freqs_axis = fftfreq(N_POINTS_FFT, 1/FS)[:N_POINTS_FFT//2]
mask_resp = (freqs_axis >= 0.1) & (freqs_axis <= 0.7)

# ==========================================
# INITIALISATION TFLITE (Moteur C++)
# ==========================================
try:
    interp_har = tf.lite.Interpreter(model_path=PATH_HAR_TFLITE)
    interp_har.allocate_tensors()
    input_har_idx = interp_har.get_input_details()[0]['index']
    output_har_idx = interp_har.get_output_details()[0]['index']

    interp_resp = tf.lite.Interpreter(model_path=PATH_RESP_TFLITE)
    interp_resp.allocate_tensors()
    input_resp_idx = interp_resp.get_input_details()[0]['index']
    output_resp_idx = interp_resp.get_output_details()[0]['index']

    ser = serial.Serial(SERIAL_PORT, 115200, timeout=1) 
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print("✅ Pont TFLite activé. Pipeline ESP32 -> Node.js en cours...")
except Exception as e:
    print(f"❌ Erreur critique au démarrage : {e}")
    exit()

# --- BUFFERS ---
buffer_har = deque(maxlen=150)  
buffer_ir = deque(maxlen=1500)  

last_state = 0    
last_rpm = 0.0    
loop_counter = 0 

ser.reset_input_buffer()

def read_binary_packet(ser):
    # Cherche le mot de synchronisation 0xBBAA envoyé par l'ESP32
    while True:
        if ser.read(1) == b'\xaa':
            if ser.read(1) == b'\xbb':
                break
    raw_data = ser.read(24)
    if len(raw_data) == 24:
        return struct.unpack('<6f', raw_data)
    return None

while True:
    try:
        vals = read_binary_packet(ser)
        if vals is None: continue

        ir_now, hr_now, spo2_now, ax, ay, az = vals

        accel_now = [ax, ay, az]
        buffer_har.append([ir_now] + accel_now)
        buffer_ir.append(ir_now)

        loop_counter += 1

        # ==========================================
        # INFÉRENCE HAR (Tous les 5 cycles)
        # ==========================================
        if len(buffer_har) == 150:
            accel_total = abs(ax) + abs(ay) + abs(az)
            
            if accel_total < 5.0:
                last_state = 0 
            elif loop_counter % 5 == 0: 
                X_window = np.array(buffer_har) 
                
                # Prétraitement
                X_window[:, 0] = sig.filtfilt(b_band, a_band, X_window[:, 0])
                mean_val = np.mean(X_window, axis=0)
                std_val = np.std(X_window, axis=0)
                X_norm = (X_window - mean_val) / (std_val + 1e-6)
                
                input_data = np.expand_dims(X_norm, axis=0).astype(np.float32)
                
                # Inférence TFLite
                interp_har.set_tensor(input_har_idx, input_data)
                interp_har.invoke()
                prediction = interp_har.get_tensor(output_har_idx)
                
                last_state = int(np.argmax(prediction))

        # ==========================================
        # INFÉRENCE RESPIRATION (Tous les 500 cycles)
        # ==========================================
        if len(buffer_ir) == 1500 and loop_counter % 500 == 0:
            window_ir = np.array(buffer_ir)
            window_ir = (window_ir - np.mean(window_ir)) / (np.std(window_ir) + 1e-6)
            
            yf = fft(window_ir)
            magnitude = 2.0 / N_POINTS_FFT * np.abs(yf[0:N_POINTS_FFT//2])
            
            spectrum_roi = magnitude[mask_resp]
            
            if np.max(spectrum_roi) > 0:
                spectrum_roi = spectrum_roi / np.max(spectrum_roi)
            
            input_data = np.expand_dims(spectrum_roi, axis=0).astype(np.float32)
            
            # Inférence TFLite
            interp_resp.set_tensor(input_resp_idx, input_data)
            interp_resp.invoke()
            last_rpm = float(interp_resp.get_tensor(output_resp_idx)[0][0])

        # --- ENVOI UDP VERS NODE.JS ---
        result_msg = f"{last_rpm:.2f},{last_state},{ir_now},{int(spo2_now)},{hr_now}"
        sock.sendto(result_msg.encode(), (UDP_IP, UDP_PORT))

    except KeyboardInterrupt:
        print("\nArrêt du pont.")
        ser.close()
        sock.close()
        break
    except Exception as e:
        pass