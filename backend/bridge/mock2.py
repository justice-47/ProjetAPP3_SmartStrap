import socket
import time
import pandas as pd
import os
import numpy as np
import scipy.signal as sig

UDP_IP = "127.0.0.1"
UDP_PORT = 8001
DATASET_PATH = r"C:\Users\Justice\Desktop\Important\Dataset\pulse-transit-time-ppg\1.1.0\csv"

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
def moyenne_glissante(signal, window_size, sigma=100):
    # Note: window_size doit être adapté à la nouvelle fréquence (50 au lieu de 500)
    x = np.arange(window_size) - (window_size - 1) / 2
    kernel = np.exp(-0.5 * (x / sigma)**2)
    kernel /= kernel.sum()  
    DC = np.convolve(signal, kernel, mode='same')

    return signal - DC

def filter_signal(signal, order=4, band=[0.75, 5], fs=50): 
    nyq = 0.5 * fs
    low = band[0] / nyq
    high = band[1] / nyq

    b, a = sig.butter(order, [low, high], btype='band')
    filtered_signal = sig.filtfilt(b, a, signal)
    
    return filtered_signal
def get_real_ir_sample(activity_type):
    filename = f"s1_{activity_type}.csv" 
    try:
        df = pd.read_csv(os.path.join(DATASET_PATH, filename), nrows=5000) 
        signal = df['pleth_2'].values.tolist()
        signal = moyenne_glissante(signal, window_size=100)
        signal = filter_signal(signal, fs=80)
        return signal
    except:
        return [50000] * 100 

scenarios = [
    {"nom": "Repos Normal", "file": "sit",   "rpm": 15.0, "state": 0, "spo2": 98},
    {"nom": "APNÉE",        "file": "sit",   "rpm": 3.0,  "state": 0, "spo2": 88},
    {"nom": "Marche",       "file": "walk",  "rpm": 22.0, "state": 1, "spo2": 97},
    {"nom": "Course",       "file": "run",   "rpm": 35.0, "state": 2, "spo2": 95},
    {"nom": "ASTHME",       "file": "sit",   "rpm": 38.0, "state": 0, "spo2": 92}
]

print("📡 Simulation réaliste lancée (Utilisation du Dataset PTT)...")

try:
    while True:
        for sc in scenarios:
            print(f"🎬 Scénario : {sc['nom']}")
            ir_samples = get_real_ir_sample(sc['file'])
            
            t_end = time.time() + 10 # Chaque phase dure 10s
            i = 0
            while time.time() < t_end:
                current_ir = ir_samples[i % len(ir_samples)]
                # Format: "RPM,STATE,IR,SPO2,HR"
                # On simule un HR cohérent : 70 (repos), 100 (marche), 150 (course)
                hr = 70 if sc['state'] == 0 else (110 if sc['state'] == 1 else 155)
                
                msg = f"{sc['rpm']:.2f},{sc['state']},{current_ir:.2f},{sc['spo2']},{hr}"
                sock.sendto(msg.encode(), (UDP_IP, UDP_PORT))
                
                i += 1
                time.sleep(0.02) # Simulation à 50Hz comme ton ESP32

except KeyboardInterrupt:
    sock.close()