const express = require("express");
const router = express.Router();
const controller = require("../controllers/oxygeneRate.controller");

router.get("/", controller.getOxygeneRate);
router.get("/weekly", controller.getWeeklyStats);

module.exports = router;