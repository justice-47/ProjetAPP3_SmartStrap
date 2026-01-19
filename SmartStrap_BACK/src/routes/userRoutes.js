const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET Profile
router.get('/profile/:userId', userController.getProfile);

// UPDATE Profile
router.put('/profile/:userId', userController.updateProfile);

module.exports = router;
