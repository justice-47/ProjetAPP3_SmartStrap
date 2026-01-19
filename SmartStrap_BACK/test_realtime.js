const dgram = require("dgram");

const UDP_PORT = 8001;
const HOST = "127.0.0.1";

const client = dgram.createSocket("udp4");

// Function to simulate oscillating signal
function sendData(i) {
  const ir = 500 + 300 * Math.sin(i * 0.5);
  const red = 400 + 200 * Math.sin(i * 0.4);
  const bpm = 70 + Math.random() * 5;
  const spo2 = 98 + Math.random();

  const data = `${ir.toFixed(2)},${red.toFixed(2)},${bpm.toFixed(2)},${spo2.toFixed(0)}`;
  const message = Buffer.from(data);

  client.send(message, UDP_PORT, HOST, (err) => {
    if (err) console.error(err);
  });
}

let count = 0;
const interval = setInterval(() => {
  sendData(count++);
  if (count > 100) clearInterval(interval);
}, 50); // 每秒 20 个数据包

console.log(`Simulating data to ${HOST}:${UDP_PORT}...`);
