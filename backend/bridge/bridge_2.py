import serial
import socket
import os
import struct
import numpy as np
import tensorflow as tf
import scipy.signal as sig
from scipy.fft import fft, fftfreq
from collections import deque


SERIAL_PORT = "COM7"  
UDP_IP = "127.0.0.1"  
UDP_PORT = 8001       

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_RESP = os.path.join(BASE_DIR, 'BIDMC_model.keras')
PATH_HAR = os.path.join(BASE_DIR, 'model95.keras')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# ==========================================
# PRE-CALCULS MATHÉMATIQUES (C++ Backend)
# ==========================================
FS = 50.0

# 1. Filtre HAR
nyq = 0.5 * FS
b_band, a_band = sig.butter(4, [0.75 / nyq, 5.0 / nyq], btype='band')

# 2. Masque FFT Respiration
N_POINTS_FFT = 1500
freqs_axis = fftfreq(N_POINTS_FFT, 1/FS)[:N_POINTS_FFT//2]
mask_resp = (freqs_axis >= 0.1) & (freqs_axis <= 0.7)
input_dim_resp = np.sum(mask_resp) 

# ==========================================
# INITIALISATION DES MODÈLES
# ==========================================
try:
    print("⏳ Chargement des modèles Keras optimisés...")
    model_resp = tf.keras.models.load_model(PATH_RESP)
    model_har = tf.keras.models.load_model(PATH_HAR)
    
    # "Warmup" (Chauffe de l'IA pour éviter le lag au premier mouvement)
    _ = model_har(np.zeros((1, 150, 4)), training=False)
    _ = model_resp(np.zeros((1, input_dim_resp)), training=False)
    
    # Connexion à l'ESP32
    ser = serial.Serial(SERIAL_PORT, 115200, timeout=1) 
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print("✅ Pipeline Binaire + Keras activé. Prêt pour le Temps Réel !")
except Exception as e:
    print(f"❌ Erreur critique : {e}")
    exit()

# --- BUFFERS ---
buffer_har = deque(maxlen=150)  
buffer_ir = deque(maxlen=1500)  

last_state = 0    
last_rpm = 0.0    
loop_counter = 0 

ser.reset_input_buffer()

def read_binary_packet(ser):
    # Cherche le mot de synchronisation 0xBBAA de l'ESP32
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
        # 1. Lecture ultra-rapide du port USB
        vals = read_binary_packet(ser)
        if vals is None: continue

        ir_now, hr_now, spo2_now, ax, ay, az = vals

        # 2. Mise à jour des buffers
        accel_now = [ax, ay, az]
        buffer_har.append([ir_now] + accel_now)
        buffer_ir.append(ir_now)

        loop_counter += 1

        if len(buffer_har) == 150 and loop_counter % 5 == 0:
            X_window = np.array(buffer_har) 
            
            # --- 1. L'HEURISTIQUE (La triche mathématique) ---
            # On calcule la force du mouvement global sur les 3 dernières secondes
            # On utilise l'écart-type (std) pour ignorer la gravité
            accel_mag = np.sqrt(X_window[:, 1]**2 + X_window[:, 2]**2 + X_window[:, 3]**2)
            movement_variance = np.std(accel_mag)
            
            # Déduction logique du mouvement (Seuils à ajuster selon ton capteur)
            if movement_variance < 0.5:     # Presque aucune variation
                logical_state = 0           # Repos
            elif movement_variance < 2.0:   # Variations modérées
                logical_state = 1           # Marche
            else:                           # Fortes secousses
                logical_state = 2           # Course

            # --- 2. PRÉDICTION DE L'IA ---
            # Filtrage et Normalisation
            X_window_filtered = np.copy(X_window)
            X_window_filtered[:, 0] = sig.filtfilt(b_band, a_band, X_window_filtered[:, 0])
            mean_val = np.mean(X_window_filtered, axis=0)
            std_val = np.std(X_window_filtered, axis=0)
            X_norm = (X_window_filtered - mean_val) / (std_val + 1e-6)
            
            input_har = np.expand_dims(X_norm, axis=0).astype(np.float32)
            prediction = model_har(input_har, training=False).numpy()
            ai_state = int(np.argmax(prediction))

            # --- 3. L'ARBITRAGE (On impose la logique) ---
            if ai_state != logical_state:
                last_state = logical_state
            else:
                last_state = ai_state

        # ==========================================
        # INFÉRENCE RESPIRATION
        # ==========================================
        if len(buffer_ir) == 1500 and loop_counter % 500 == 0:
            window_ir = np.array(buffer_ir)
            window_ir = (window_ir - np.mean(window_ir)) / (np.std(window_ir) + 1e-6)
            
            yf = fft(window_ir)
            magnitude = 2.0 / N_POINTS_FFT * np.abs(yf[0:N_POINTS_FFT//2])
            
            spectrum_roi = magnitude[mask_resp]
            
            if np.max(spectrum_roi) > 0:
                spectrum_roi = spectrum_roi / np.max(spectrum_roi)
            
            input_resp = np.expand_dims(spectrum_roi, axis=0)
            
            # Appel IA direct
            last_rpm = float(model_resp(input_resp, training=False).numpy()[0][0])

        # --- ENVOI UDP VERS NODE.JS ---
        result_msg = f"{last_rpm:.2f},{last_state},{ir_now},{int(spo2_now)},{hr_now}"
        sock.sendto(result_msg.encode(), (UDP_IP, UDP_PORT))

    except KeyboardInterrupt:
        print("\nArrêt du pont Python.")
        ser.close()
        sock.close()
        break
    except Exception as e:
        pass