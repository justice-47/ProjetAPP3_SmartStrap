require("dotenv").config();
const app = require("./src/app");
const { startRealtimeService } = require("./src/services/realtime.service");

const PORT = process.env.PORT || 3000;

console.log("⏳ Initialisation des services...");

try {
  // Lancement des services (UDP + WebSocket)
  const { wss, udpServer } = startRealtimeService();

  // Lancement du serveur HTTP Express
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`
    ✅ SERVEUR ACTIF
    -----------------------------------
    🌐 API HTTP    : Port ${PORT}
    📱 WebSocket   : Port 8000
    📡 Réception IA : Port 8001
    -----------------------------------
    `);
  });

  // Sécurité pour fermer proprement
  const shutdown = () => {
    console.log("\n♻️ Fermeture des ports...");
    if (wss) wss.close();
    if (udpServer) udpServer.close();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("❌ ERREUR AU DÉMARRAGE :", error.message);
  process.exit(1); // Arrêt avec code d'erreur si l'IA ou le WS ne se lancent pas
}
