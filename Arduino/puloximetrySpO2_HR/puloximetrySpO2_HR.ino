#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

#define REPORTING_PERIOD_MS     1000

PulseOximeter pox; //pox est le module de contrôle du capteur, 
uint32_t tsLastReport = 0;

void onBeatDetected() {
    Serial.println("♥ Battement !");
}

void setup() {
    Serial.begin(115200);
    Serial.print("Initialisation du MAX30100...");

    if (!pox.begin()) {
        Serial.println("ECHEC");
        for(;;);
    } else {
        Serial.println("SUCCES");
    }

    
    pox.setIRLedCurrent(MAX30100_LED_CURR_30_6MA);

    pox.setOnBeatDetectedCallback(onBeatDetected);
}

void loop() {
    pox.update();

    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
        Serial.print("BPM: ");
        Serial.print(pox.getHeartRate());
        Serial.print(" | SpO2: ");
        Serial.print(pox.getSpO2());
        Serial.println("%");

        tsLastReport = millis();
    }
}