const express = require("express");
const router = express.Router();
const controller = require("../controllers/heartRate.controller");

router.get("/", controller.getHeartRate);
router.get("/weekly", controller.getWeeklyStats);

module.exports = router;