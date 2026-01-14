const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/api/heart-rate", require("./routes/heartRate.routes"));
app.use("/api/oxygene-rate", require("./routes/oxygeneRate.routes"));
app.use("/api/auth", require("./routes/authRoutes"));

module.exports = app;
