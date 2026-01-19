const dgram = require("dgram");
const { WebSocketServer } = require("ws");

function startRealtimeService() {
  const WS_PORT = process.env.WS_PORT || 8000;
  const UDP_PORT = process.env.UDP_PORT || 8001;

  // 1. Configuration du WebSocket (Pour l'App Mobile)
  const wss = new WebSocketServer({ port: WS_PORT });

  // Map to store userId -> ws connection
  const userConnections = new Map();

  wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`📱 [WS] App connectée ! (IP: ${clientIp})`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        // a. Identification de l'utilisateur
        if (data.type === 'IDENTIFY') {
          ws.userId = data.userId;
          userConnections.set(data.userId, ws);
          console.log(`👤 Utilisateur ${data.userId} identifié sur WS`);
        }

        // b. Message de chat en temps réel
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
        console.error("Erreur parsing message WS:", err);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        userConnections.delete(ws.userId);
        console.log(`📱 [WS] App déconnectée (User: ${ws.userId}).`);
      } else {
        console.log(`📱 [WS] App déconnectée.`);
      }
    });
  });

  // 3. Configuration de l'UDP (Pour l'ESP32)
  const udpServer = dgram.createSocket("udp4");
  let firstPacket = true;

  udpServer.on("message", (data, rinfo) => {
    if (firstPacket) {
      console.log(
        `📡 [UDP] Premier paquet reçu de l'ESP32 ! (IP: ${rinfo.address})`
      );
      firstPacket = false;
    }

    const raw = data.toString().trim();
    const values = raw.split(",");

    if (values.length >= 4) {
      const payload = JSON.stringify({
        type: 'SENSOR_DATA',
        ir: values[0],
        red: values[1],
        bpm: values[2],
        spo2: values[3],
      });

      // Diffusion vers le mobile (seulement pour l'utilisateur concerné ou tout le monde pour l'instant)
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  });

  udpServer.on("error", (err) => {
    console.error(`❌ [UDP] Erreur: ${err.stack}`);
  });

  udpServer.bind(UDP_PORT, "0.0.0.0", () => {
    console.log(`📡 Serveur UDP écoute sur le port ${UDP_PORT}`);
  });

  // Utility to send notification to a specific user
  startRealtimeService.sendNotification = (userId, notification) => {
    const ws = userConnections.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'NOTIFICATION',
        ...notification
      }));
    }
  };
}

module.exports = { startRealtimeService };
