#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

#define REPORTING_PERIOD_MS 20 

PulseOximeter pox;
uint32_t lastReportTime = 0;

// Adresse du MPU6050
const int MPU_ADDR = 0x68;

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);

    // 1. Initialisation MAX30100 (Librairie)
    if (!pox.begin()) {
        // Serial.println("ERR_MAX");
    }
    pox.setIRLedCurrent(MAX30100_LED_CURR_50MA);

    // 2. Initialisation MPU6050 (Mode Direct - Force le réveil)
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B);  // Registre de gestion d'énergie
    Wire.write(0);     // Écrire 0 pour le réveiller (WAKE UP)
    Wire.endTransmission(true);
}

void loop() {
    pox.update();

    if (millis() - lastReportTime > REPORTING_PERIOD_MS) {
        
        // --- LECTURE DIRECTE MPU6050 ---
        Wire.beginTransmission(MPU_ADDR);
        Wire.write(0x3B);  // Demander le registre de l'accélération (ACCEL_XOUT_H)
        Wire.endTransmission(false);
        // On demande 6 octets (X, Y, Z, chaque valeur fait 2 octets)
        Wire.requestFrom(MPU_ADDR, 6, true); 

        // Reconstitution des valeurs (Maths binaires)
        int16_t AcX = Wire.read() << 8 | Wire.read();
        int16_t AcY = Wire.read() << 8 | Wire.read();
        int16_t AcZ = Wire.read() << 8 | Wire.read();
        
        // Conversion approximative pour l'IA (échelle +/- 8g par défaut)
        // On divise par 16384 pour avoir des G (gravité)
        float ax = AcX / 16384.0;
        float ay = AcY / 16384.0;
        float az = AcZ / 16384.0;

        // --- ENVOI CSV POUR PYTHON ---
        // Format : IR, BPM, SpO2, AX, AY, AZ
        Serial.print(pox.getFilteredIR()); Serial.print(",");
        Serial.print(pox.getHeartRate());  Serial.print(",");
        Serial.print(pox.getSpO2());       Serial.print(",");
        
        Serial.print(ax); Serial.print(",");
        Serial.print(ay); Serial.print(",");
        Serial.println(az);

        lastReportTime = millis();
    }
}