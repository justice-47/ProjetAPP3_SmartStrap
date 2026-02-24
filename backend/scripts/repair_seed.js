const pool = require('../src/config/db');

async function repairSeed() {
  const client = await pool.connect();
  try {
    console.log("Repairing seed data...");

    // 1. We'll use user ID 1 (Dupont) as the "Doctor" participant for other users
    const doctorId = 1;
    
    // 2. Get all other real users
    const users = await client.query('SELECT id, nom FROM users WHERE id != $1', [doctorId]);
    
    for (const user of users.rows) {
      const userId = user.id;
      console.log(`Seeding for user ${user.nom} (ID: ${userId})...`);

      // Seed Notifications
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
        VALUES 
          ($1, 'alert', 'Fréquence cardiaque élevée', 'Votre rythme cardiaque a dépassé 100 BPM.', false, NOW()),
          ($1, 'message', 'Nouveau message reçu', 'Dr. Dupont vous a envoyé un message.', false, NOW() - INTERVAL '1 hour')
        ON CONFLICT DO NOTHING;
      `, [userId]);

      // Seed Messages (between Dupont and User)
      await client.query(`
        INSERT INTO messages (sender_id, receiver_id, content, created_at)
        VALUES 
          ($1, $2, 'Bonjour Michael, comment allez-vous aujourd''hui ?', NOW() - INTERVAL '2 hours'),
          ($2, $1, 'Ça va bien Docteur, merci !', NOW() - INTERVAL '1 hour'),
          ($1, $2, 'Parfait, continuez à suivre vos constantes.', NOW() - INTERVAL '30 minutes')
        ON CONFLICT DO NOTHING;
      `, [doctorId, userId]);
    }

    console.log("Repair completed successfully ✅");
  } catch (err) {
    console.error("Error repairing seed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

repairSeed();
