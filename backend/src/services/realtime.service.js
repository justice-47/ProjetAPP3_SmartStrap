const dgram = require("dgram");
const { WebSocketServer } = require("ws");

function startRealtimeService() {
  const WS_PORT = process.env.WS_PORT || 8000;
  const UDP_PORT = process.env.UDP_PORT || 8001;
  const HAR_LABELS = ["Repos", "Marche", "Course"];

  const wss = new WebSocketServer({ port: WS_PORT });
  const udpServer = dgram.createSocket("udp4");

  udpServer.on("message", (data) => {
    const vals = data.toString().split(",");
    if (vals.length < 5) return;

    const rpm = parseFloat(vals[0]),
      state = parseInt(vals[1]);
    const ir = parseFloat(vals[2]),
      spo2 = parseInt(vals[3]),
      bpm = parseFloat(vals[4]);

    let status = "Normal",
      severity = "info",
      msg = "";

    // Logique Asthme / Apnée
    if (state === 0 && rpm < 8 && spo2 < 92) {
      status = "Apnée";
      severity = "critical";
      msg = "Arrêt respiratoire suspecté !";
    } else if (rpm > 25 && bpm > 110 && spo2 < 94) {
      status = "Asthme";
      severity = "critical";
      msg = "Crise d'asthme probable !";
    }

    const payload = JSON.stringify({
      type: "SENSOR_DATA",
      healthData: { rpm, bpm, spo2, ir, state, stateLabel: HAR_LABELS[state] },
      diagnosis: { status, message: msg, severity },
    });

    wss.clients.forEach((c) => {
      if (c.readyState === 1) c.send(payload);
    });
  });

  udpServer.bind(UDP_PORT);
  return { wss, udpServer };
}

module.exports = { startRealtimeService };
