const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

// GET /api/doctor/patients/:doctorId
router.get('/patients/:doctorId', doctorController.getPatients);

// GET /api/doctor/patient-stats/:patientId
router.get('/patient-stats/:patientId', doctorController.getPatientStats);

// GET /api/doctor/dashboard-stats/:doctorId
router.get('/dashboard-stats/:doctorId', doctorController.getDashboardStats);

module.exports = router;
