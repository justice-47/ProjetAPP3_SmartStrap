const dgram = require("dgram");
const { WebSocketServer } = require("ws");

function startRealtimeService() {
  const WS_PORT = process.env.WS_PORT || 8000;
  const UDP_PORT = process.env.UDP_PORT || 8001;

  const HAR_LABELS = ["Assis", "Marche", "Course"];

  // 1. Configuration du WebSocket
  const wss = new WebSocketServer({ port: WS_PORT });
  const userConnections = new Map();

  wss.on("connection", (ws, req) => {
    console.log(`📱 [WS] App connectée (IP: ${req.socket.remoteAddress})`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        // Identification de l'utilisateur
        if (data.type === 'IDENTIFY') {
          ws.userId = data.userId;
          userConnections.set(data.userId, ws);
          console.log(`👤 Utilisateur ${data.userId} identifié.`);
        }

        // Chat en temps réel
        if (data.type === 'CHAT_MESSAGE') {
          const { receiverId, senderId, content } = data;
          const targetWs = userConnections.get(receiverId);
          if (targetWs && targetWs.readyState === 1) {
            targetWs.send(JSON.stringify({
              type: 'NEW_MESSAGE',
              senderId,
              content,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (err) {
        console.error("❌ Erreur parsing message WS:", err);
      }
    });

    ws.on("close", () => {
      if (ws.userId) userConnections.delete(ws.userId);
      console.log(`📱 [WS] App déconnectée.`);
    });
  });

  // 2. Configuration de l'UDP (Réception ESP32)
  const udpServer = dgram.createSocket("udp4");
  let firstPacket = true;

  udpServer.on("message", (data, rinfo) => {
    if (firstPacket) {
      console.log(`📡 [UDP] Premier paquet reçu de l'ESP32 ! (IP: ${rinfo.address})`);
      firstPacket = false;
    }

    try {
      const raw = data.toString().trim();
      const values = raw.split(",");

      // ADAPTATION : Lecture des 5 valeurs envoyées par ton code Arduino
      // Format attendu: RPM, StateIA, IR_Raw, SpO2, HeartRate
      if (values.length >= 5) {
        const stateIndex = parseInt(values[1]);

        const payload = JSON.stringify({
          type: 'SENSOR_DATA',
          healthData: {
            rpm: parseFloat(values[0]),           // Respiration (IA)
            state: stateIndex,                    // Index HAR (IA)
            stateLabel: HAR_LABELS[stateIndex] || "Inconnu",
            ir: parseFloat(values[2]),            // Signal IR brut
            spo2: parseInt(values[3]),            // Oxygène
            bpm: parseFloat(values[4]),           // Rythme cardiaque
            timestamp: Date.now()
          }
        });

        // Diffusion vers toutes les applications mobiles connectées
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(payload);
          }
        });
      }
    } catch (e) {
      console.error("❌ Erreur de parsing UDP:", e);
    }
  });

  udpServer.on("error", (err) => {
    console.error(`❌ [UDP] Erreur: ${err.stack}`);
  });

  udpServer.bind(UDP_PORT, "0.0.0.0", () => {
    console.log(`
    🚀 SERVICES TEMPS RÉEL DÉMARRÉS
    -----------------------------------
    📡 UDP (ESP32)  : Port ${UDP_PORT}
    📱 WS  (Mobile) : Port ${WS_PORT}
    -----------------------------------
    `);
  });
}

module.exports = { startRealtimeService };