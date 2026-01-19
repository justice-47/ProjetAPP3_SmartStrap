const express = require("express");
const app = express();
const cors = require("cors");

// Import routes
const heartRateRoutes = require('./routes/heartRate.routes');
const oxygeneRateRoutes = require('./routes/oxygeneRate.routes');
const authRoutes = require('./routes/authRoutes'); // Assuming authRoutes is also refactored
const userRoutes = require('./routes/userRoutes'); // New import
const chatRoutes = require('./routes/chat.routes'); // New import
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const doctorRoutes = require('./routes/doctor.routes');

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/heart-rate', heartRateRoutes); // Original path, using imported constant
app.use('/api/oxygene-rate', oxygeneRateRoutes); // Original path, using imported constant
app.use('/api/auth', authRoutes); // Original path, using imported constant
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctor', doctorRoutes);

// Route de diagnostic
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SmartStrap Backend is running', timestamp: new Date() });
});

// Middleware pour gérer les routes non trouvées (404) avec du JSON et non du HTML
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} non trouvée sur ce serveur.` });
});

// Middleware de gestion d'erreurs global pour toujours renvoyer du JSON
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({ 
    message: 'Une erreur interne est survenue sur le serveur.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
