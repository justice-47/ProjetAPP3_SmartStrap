require('dotenv').config();
const app = require('./src/app');
const { startRealtimeService } = require('./src/services/realtime.service');

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port ${PORT} (accessible via IP locale)`);
  startRealtimeService();
});
