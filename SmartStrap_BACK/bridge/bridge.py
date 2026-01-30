import serial
import socket
import os
import time
import numpy as np
import tensorflow as tf
from scipy.fftpack import fft

# --- CONFIGURATION ---
SERIAL_PORT = "COM8"  # <-- MODIFIE CECI selon ton port Windows
UDP_IP = "127.0.0.1"  # Localhost car Node.js est sur la même machine
UDP_PORT = 8001       # Port d'écoute UDP de Node.js

# --- GESTION DYNAMIQUE DES CHEMINS ---
# Permet de lancer le script de n'importe où sans perdre les modèles
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_RESP = os.path.join(BASE_DIR, 'BIDMC_model.keras')
PATH_HAR = os.path.join(BASE_DIR, 'model95.keras')

# --- CHARGEMENT DES MODÈLES ET CONNEXIONS ---
print(f"⏳ Chargement des modèles depuis : {BASE_DIR}")
try:
    # Désactive les optimisations oneDNN si elles spamment la console
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    
    model_resp = tf.keras.models.load_model(PATH_RESP)
    model_har = tf.keras.models.load_model(PATH_HAR)
    
    # Timeout court pour ne pas bloquer si l'ESP32 ne répond pas
    ser = serial.Serial(SERIAL_PORT, 115200, timeout=0.1)
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print(f"✅ IA chargée. Connexion Série sur {SERIAL_PORT} OK.")
    print(f"🚀 Pipeline actif : ESP32 -> Python -> Node.js (UDP:{UDP_PORT})")
except Exception as e:
    print(f"❌ Erreur critique au démarrage : {e}")
    print("Vérifie le port COM et la présence des fichiers .keras")
    exit()

# --- BUFFERS ET VARIABLES D'ÉTAT ---
buffer_har = []   # Fenêtre de 3s (150 points) pour le mouvement
buffer_ir = []    # Fenêtre de 30s (1500 points) pour la respiration
last_state = 0    # 0=Assis/Repos par défaut
last_rpm = 0.0    

while True:
    try:
        # 1. Lecture Série Robuste
        try:
            # errors='ignore' évite le crash sur des octets corrompus au démarrage
            line = ser.readline().decode('utf-8', errors='ignore').strip()
        except Exception:
            continue

        # Filtrage des logs de démarrage de l'ESP32 (qui n'ont pas de virgule)
        if not line or ',' not in line:
            continue
        
        # 2. Parsing des données (IR, BPM, SpO2, AX, AY, AZ)
        parts = line.split(',')
        if len(parts) < 6: continue # Ignore les lignes incomplètes

        try:
            vals = [float(x) for x in parts]
        except ValueError: continue # Ignore si une valeur n'est pas un nombre

        ir_now = vals[0]
        hr_now = vals[1]   
        spo2_now = vals[2] 
        accel_now = [vals[3], vals[4], vals[5]]

        # 3. TRAITEMENT DU MOUVEMENT (HAR)
        # Le modèle attend [IR, AX, AY, AZ]
        buffer_har.append([ir_now] + accel_now)
        if len(buffer_har) > 150: buffer_har.pop(0)

        # GARDE-FOU ANTI-HALLUCINATION :
        # Si la somme des accélérations est trop faible (< 5g cumulés), 
        # c'est que le capteur est débranché ou posé à plat. On force "Repos".
        accel_total = abs(accel_now[0]) + abs(accel_now[1]) + abs(accel_now[2])
        
        if accel_total < 5.0:
             last_state = 0 # Force l'état "Assis/Repos"
        elif len(buffer_har) == 150:
            # Sinon, si le buffer est plein, on interroge l'IA
            input_har = np.array([buffer_har])
            prediction = model_har.predict(input_har, verbose=0)
            last_state = int(np.argmax(prediction))

        # 4. TRAITEMENT DE LA RESPIRATION (RPM)
        buffer_ir.append(ir_now)
        if len(buffer_ir) > 1500: buffer_ir.pop(0)

        if len(buffer_ir) == 1500 and len(buffer_ir) % 500 == 0:
            signal = np.array(buffer_ir)
            signal = (signal - np.mean(signal)) / (np.std(signal) + 1e-6)
            
            yf = np.abs(fft(signal))
            features = yf[3:22] 
            features = features / (np.max(features) + 1e-6) 
            
            input_resp = np.array([features])
            last_rpm = float(model_resp.predict(input_resp, verbose=0)[0][0])

        result_msg = f"{last_rpm:.2f},{last_state},{ir_now},{int(spo2_now)},{hr_now}"
        sock.sendto(result_msg.encode(), (UDP_IP, UDP_PORT))

    except KeyboardInterrupt:
        print("\nArrêt du pont Python.")
        ser.close()
        sock.close()
        break
    except Exception as e:
        time.sleep(0.01) 
        continue