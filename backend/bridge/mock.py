import serial
import socket
import time

# Configuration
SERIAL_PORT = "COM7" 
UDP_IP = "127.0.0.1"
UDP_PORT = 8001

scenarios = [
{"nom": "🟢 Repos Normal", "rpm": 14.0, "state": 0, "spo2": 98, "hr": 70},
    {"nom": "🔴 APNÉE (Alerte)", "rpm": 3.0,  "state": 0, "spo2": 88, "hr": 55},
    {"nom": "🔵 Marche",        "rpm": 22.0, "state": 1, "spo2": 97, "hr": 100},
    {"nom": "🏃 COURSE",        "rpm": 42.0, "state": 2, "spo2": 95, "hr": 155},
    {"nom": "🟠 ASTHME (Alerte)", "rpm": 38.0, "state": 0, "spo2": 92, "hr": 115}
]

try:
    ser = serial.Serial(SERIAL_PORT, 115200, timeout=1)
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print(f"✅ Connecté à {SERIAL_PORT}. Injection du signal IR réel...")

    while True:
        for sc in scenarios:
            print(f"\n>>> Mode actuel : {sc['nom']}")
            start_time = time.time()
            
            # Exécute chaque scénario pendant 15 secondes
            while time.time() - start_time < 15:
                line = ser.readline().decode('ascii', errors='replace').strip()
                
                if line:
                    try:
                        real_ir = float(line)
                        
                        # Construction du message hybride
                        result_msg = f"{sc['rpm']:.2f},{sc['state']},{real_ir:.2f},{sc['spo2']},{sc['hr']}"
                        
                        # Envoi vers Node.js
                        sock.sendto(result_msg.encode(), (UDP_IP, UDP_PORT))
                        
                    except ValueError:
                        continue 

except KeyboardInterrupt:
    print("\nArrêt du pont hybride.")
    ser.close()
    sock.close()