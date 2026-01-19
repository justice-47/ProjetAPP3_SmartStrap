const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- GET PROFILE ---
exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  const client = await db.connect();

  try {
    // Fetch user details + patient details (if role is patient)
    // Using a LEFT JOIN to get patient info if it exists
    const query = `
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.role, u.phone,
        p.age, p.contact_urgence, p.id_naissance,
        p.poids, p.taille, p.genre, p.antecedents
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      WHERE u.id = $1
    `;
    
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Erreur getProfile :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { 
    nom, prenom, email, phone, // User fields
    poids, taille, genre, antecedents, age, contactUrgence // Patient fields
  } = req.body;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Update USERS table
    const updateUserQuery = `
      UPDATE users 
      SET nom = COALESCE($1, nom), 
          prenom = COALESCE($2, prenom), 
          email = COALESCE($3, email), 
          phone = COALESCE($4, phone)
      WHERE id = $5
    `;
    await client.query(updateUserQuery, [nom, prenom, email, phone, userId]);

    // 2. Update PATIENTS table (if user is patient)
    // We check if the user is a patient first or just try to update
    const updatePatientQuery = `
      UPDATE patients
      SET poids = COALESCE($1, poids),
          taille = COALESCE($2, taille),
          genre = COALESCE($3, genre),
          antecedents = COALESCE($4, antecedents),
          age = COALESCE($5, age),
          contact_urgence = COALESCE($6, contact_urgence)
      WHERE user_id = $7
    `;
    
    await client.query(updatePatientQuery, [
        poids, taille, genre, antecedents, age, contactUrgence, userId
    ]);

    await client.query('COMMIT');
    res.status(200).json({ message: "Profil mis à jour avec succès ✅" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erreur updateProfile :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};
