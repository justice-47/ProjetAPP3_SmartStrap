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

// --- 2. CONNEXION ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    const user = result.rows[0];

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Succès
    res.status(200).json({
      message: "Connexion réussie ✅",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;