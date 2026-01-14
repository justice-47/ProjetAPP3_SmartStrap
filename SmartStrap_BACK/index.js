const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
app.use(express.json()); 

app.get("/", (req, res) => {
  res.send("Backend SmartStrap opérationnel");
});

app.get("/heart-rate/weekly", (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const last7Days = heartRateMeasurements.filter(
    m => m.recordedAt >= sevenDaysAgo
  );

  if (last7Days.length === 0) {
    return res.json({ weeklyAverage: null, trend: "indéterminée", dailyData: [] });
  }

  const total = last7Days.reduce((sum, m) => sum + m.bpm, 0);
  const weeklyAverage = Math.round(total / last7Days.length);

  const dailyMap = {};
  last7Days.forEach(m => {
    const day = m.recordedAt.toISOString().split("T")[0];
    if (!dailyMap[day]) dailyMap[day] = [];
    dailyMap[day].push(m.bpm);
  });

  const dailyData = Object.keys(dailyMap)
    .sort()
    .map(day => ({
      date: day,
      avg: Math.round(
        dailyMap[day].reduce((a, b) => a + b, 0) / dailyMap[day].length
      )
    }));

  let trend = "stable";
  if (dailyData.length >= 2) {
    const diff = dailyData[dailyData.length - 1].avg - dailyData[0].avg;
    if (diff > 2) trend = "hausse";
    else if (diff < -2) trend = "baisse";
  }

  res.json({ weeklyAverage, trend, dailyData });
});

app.post("/heart-rate", (req, res) => {
  const { bpm } = req.body;

  if (!bpm || bpm < 30 || bpm > 220) {
    return res.status(400).json({ message: "Valeur BPM invalide" });
  }

  heartRateMeasurements.push({ bpm, recordedAt: new Date() });

  broadcast({
    type: "heart_rate",
    bpm,
    recordedAt: new Date()
  });

  res.json({ message: "Mesure ajoutée" });
});


const server = http.createServer(app);
server.listen(3000, () => {
  console.log("Serveur HTTP lancé sur http://localhost:3000");
});

const wss = new WebSocket.Server({ server });

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client WebSocket connecté");
});
