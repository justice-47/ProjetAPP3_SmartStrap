const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// --- CONFIGURATION EMAIL ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TON_EMAIL@gmail.com', 
    pass: 'TON_MOT_DE_PASSE_D_APPLICATION' // Les 16 lettres de Google
  }
});

// --- 1. INSCRIPTION ---
router.post('/register', async (req, res) => {
  const {
    nom,
    prenom,
    email,
    password,
    role,
    phone,

    // patient
    dateNaissance,
    contactUrgence,

    // medecin
    rpps,
    specialite,
    hopital
  } = req.body;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ insertion dans users
    const userResult = await client.query(
      `INSERT INTO users (nom, prenom, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        nom,
        prenom,
        email.toLowerCase().trim(),
        hashedPassword,
        role,
        phone
      ]
    );

    const userId = userResult.rows[0].id;

    // 3️⃣ insertion dans patients
    if (role === 'patient') {
      const age =
        new Date().getFullYear() - new Date(dateNaissance).getFullYear();

      await client.query(
        `INSERT INTO patients
         (user_id, nom, prenom, age, contact_urgence, id_naissance)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          nom,
          prenom,
          age,
          contactUrgence || null,
          dateNaissance
        ]
      );
    }

    // 4️⃣ insertion dans medecins
    if (role === 'medecin') {
      await client.query(
        `INSERT INTO medecins
         (user_id, specialite, numero_ordre, hopital)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          specialite,
          rpps,
          hopital
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: "Inscription réussie ✅",
      userId
    });

  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    console.error("Erreur register :", error);
    res.status(500).json({ message: "Erreur serveur." });

  } finally {
    client.release();
  }
});

module.exports = router;