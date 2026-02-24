const db = require('../config/db');

// --- GET PATIENTS FOR DOCTOR ---
exports.getPatients = async (req, res) => {
  const { doctorId } = req.params;
  const client = await db.connect();

  try {
    const query = `
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.phone,
        p.id as patient_id, p.age, p.genre, p.antecedents
      FROM users u
      JOIN patients p ON u.id = p.user_id
      WHERE p.medecin_id = $1
    `;
    
    const result = await client.query(query, [doctorId]);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erreur getPatients :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};

// --- GET PATIENT DETAILS & RECENT VITALS ---
exports.getPatientStats = async (req, res) => {
  const { patientId } = req.params;
  const client = await db.connect();

  try {
    // 1. Get latest Heart Rate
    const hrQuery = `
      SELECT bpm, measured_at 
      FROM heart_rate 
      WHERE patient_id = $1 
      ORDER BY measured_at DESC 
      LIMIT 10
    `;
    const hrResult = await client.query(hrQuery, [patientId]);

    // 2. Get latest Oxygen Rate
    const oxQuery = `
      SELECT spo2, measured_at 
      FROM oxygene_rate 
      WHERE patient_id = $1 
      ORDER BY measured_at DESC 
      LIMIT 10
    `;
    const oxResult = await client.query(oxQuery, [patientId]);

    res.status(200).json({
      heartRate: hrResult.rows,
      oxygeneRate: oxResult.rows
    });

  } catch (error) {
    console.error("Erreur getPatientStats :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};

// --- GET DASHBOARD STATS ---
exports.getDashboardStats = async (req, res) => {
  const { doctorId } = req.params;
  const client = await db.connect();

  try {
    // 1. Total Patients
    const patientCountResult = await client.query(
      'SELECT COUNT(*) FROM patients WHERE medecin_id = $1',
      [doctorId]
    );
    const patientCount = parseInt(patientCountResult.rows[0].count);

    // 2. Alert Count (Active alerts from notifications table linked to these patients)
    // Assuming notifications are linked to users (patients), we need to join patients -> users -> notifications
    const alertCountResult = await client.query(`
      SELECT COUNT(n.id) 
      FROM notifications n
      JOIN patients p ON n.user_id = p.user_id
      WHERE p.medecin_id = $1 AND n.type = 'alert' AND n.is_read = false
    `, [doctorId]);
    const alertCount = parseInt(alertCountResult.rows[0].count);

    // 3. Recent Alerts
    const recentAlertsResult = await client.query(`
      SELECT n.id, n.title, n.message, n.created_at, p.nom, p.prenom
      FROM notifications n
      JOIN patients p ON n.user_id = p.user_id
      WHERE p.medecin_id = $1 AND n.type = 'alert'
      ORDER BY n.created_at DESC
      LIMIT 5
    `, [doctorId]);

    res.status(200).json({
      patientCount,
      alertCount,
      recentAlerts: recentAlertsResult.rows
    });

  } catch (error) {
    console.error("Erreur getDashboardStats :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    client.release();
  }
};
