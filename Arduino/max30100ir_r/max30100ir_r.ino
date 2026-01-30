#include <WiFi.h>
#include <WiFiUdp.h> 
#include <Wire.h>
#include "MAX30100.h"

const char* ssid = "Justice";
const char* password = "justice1:8";
const char* serverIP = "10.154.91.164";
const int serverPort = 8001;

MAX30100 sensor;
WiFiUDP udp; 

// Variables de filtrage et seuil
float ir_dc_filter = 0, red_dc_filter = 0;
const float alpha = 0.97;
float last_ir_ac = 0;
float last_red_ac = 0;
const float SEUIL_MOUVEMENT = 800.0; // Ton seuil pour filtrer les chocs

String dataBuffer = ""; 
int batchCounter = 0;
unsigned long lastSampleTime = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.setClock(100000); // Stable pour la FIFO

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✅ WiFi OK");

  initSensor();
}

void initSensor() {
  if (sensor.begin()) {
    sensor.setMode(MAX30100_MODE_SPO2_HR);
    sensor.setLedsCurrent(MAX30100_LED_CURR_50MA, MAX30100_LED_CURR_50MA);
    sensor.setSamplingRate(MAX30100_SAMPRATE_100HZ);
    sensor.resetFifo(); 
    Serial.println("✅ Capteur Initialisé");
  }
}

void loop() {
  sensor.update();
  uint16_t ir_raw, red_raw;
  bool dataReady = false;

  while (sensor.getRawValues(&ir_raw, &red_raw)) {
    dataReady = true;
    lastSampleTime = millis();

    // 1. Filtrage DC
    ir_dc_filter = (alpha * ir_dc_filter) + ((1.0 - alpha) * (float)ir_raw);
    red_dc_filter = (alpha * red_dc_filter) + ((1.0 - alpha) * (float)red_raw);

    float ir_ac = (float)ir_raw - ir_dc_filter;
    float red_ac = (float)red_raw - red_dc_filter;

    // 2. Application du SEUIL (Anti-mouvement)
    if (abs(ir_ac) > SEUIL_MOUVEMENT) ir_ac = last_ir_ac;
    else last_ir_ac = ir_ac;

    if (abs(red_ac) > SEUIL_MOUVEMENT) red_ac = last_red_ac;
    else last_red_ac = red_ac;

    // 3. Préparation du paquet
    char part[40];
    snprintf(part, sizeof(part), "%.0f,%.0f|", ir_ac, red_ac);
    dataBuffer += part;
    batchCounter++;

    if (batchCounter >= 10) {
      udp.beginPacket(serverIP, serverPort);
      udp.print(dataBuffer);
      udp.endPacket();
      dataBuffer = "";
      batchCounter = 0;
    }
  }

  // 4. Sécurité FIFO : Si rien depuis 1s, on reset
  if (millis() - lastSampleTime > 1000) {
    Serial.println("⚠️ FIFO vide, reset...");
    sensor.resetFifo();
    lastSampleTime = millis();
  }
}