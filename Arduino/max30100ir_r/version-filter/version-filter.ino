#include <WiFi.h>
#include <WiFiUdp.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

// ===== CONFIGURATION =====
const char* ssid = "MPI";
const char* password = "MpI_pro3@25#eSaTiC";
const char* serverIP = "192.168.1.230"; 
const int serverPort = 8001;            

PulseOximeter pox;
WiFiUDP udp;

// Timer pour l'envoi non-bloquant
unsigned long lastSendTime = 0;

void onBeatDetected() {
    // Serial.println("💓 Beat!");
}

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);
    Wire.setClock(100000);

    // WiFi
    Serial.print("Connexion WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ WiFi OK");

    // Capteur
    if (!pox.begin()) {
        Serial.println("❌ ÉCHEC Capteur");
        for(;;);
    }

    pox.setIRLedCurrent(MAX30100_LED_CURR_50MA);
    pox.setOnBeatDetectedCallback(onBeatDetected);
}

void loop() {
    // 1. MISE À JOUR CRITIQUE (Doit tourner le plus vite possible)
    pox.update();

    // 2. ENVOI PÉRIODIQUE (50Hz = toutes les 20ms)
    if (millis() - lastSendTime > 20) {
        
        float ir_ac = pox.getFilteredIR();
        float red_ac = pox.getFilteredRed(); // Ajout du Rouge
        float bpm = pox.getHeartRate();
        uint8_t spo2 = pox.getSpO2();

        // On n'envoie que si le capteur détecte un doigt (signal non vide)
        if (ir_ac != 0 || red_ac != 0) {
            char msg[64];
            // Format: "IR,RED,BPM,SPO2"
            snprintf(msg, sizeof(msg), "%.2f,%.2f,%.1f,%u", ir_ac, red_ac, bpm, spo2);

            udp.beginPacket(serverIP, serverPort);
            udp.print(msg);
            udp.endPacket();
        }
        
        lastSendTime = millis();
    }
}