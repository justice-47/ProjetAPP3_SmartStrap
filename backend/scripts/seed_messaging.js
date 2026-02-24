const pool = require('../src/config/db');

async function seedData() {
  const client = await pool.connect();
  try {
    console.log("Seeding messages and notifications...");

    // 1. Get some users to link to
    const userRes = await client.query('SELECT id FROM users LIMIT 2');
    if (userRes.rows.length < 1) {
      console.error("No users found. Please sign up at least one user first.");
      return;
    }

    const userId = userRes.rows[0].id;
    // If only one user, we'll use a dummy ID for the other side of messages
    const otherId = userRes.rows[1]?.id || 999; 

    // 2. Seed Messages
    await client.query(`
      INSERT INTO messages (sender_id, receiver_id, content, created_at)
      VALUES 
        ($1, $2, 'Bonjour ! Comment allez-vous aujourd''hui ?', NOW() - INTERVAL '2 hours'),
        ($2, $1, 'Ça va très bien, merci ! Mes constantes sont stables.', NOW() - INTERVAL '1 hour'),
        ($1, $2, 'Parfait. N''oubliez pas de boire de l''eau régulièrement.', NOW() - INTERVAL '30 minutes'),
        ($2, $1, 'Entendu, merci du conseil Dr Bennett.', NOW() - INTERVAL '10 minutes')
      ON CONFLICT DO NOTHING;
    `, [otherId, userId]);

    // 3. Seed Notifications
    await client.query(`
      INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
      VALUES 
        ($1, 'alert', 'Fréquence cardiaque élevée', 'Votre rythme cardiaque a dépassé 100 BPM au repos.', false, NOW() - INTERVAL '1 day'),
        ($1, 'system', 'Mise à jour disponible', 'Une nouvelle version de l''application SmartStrap est disponible.', true, NOW() - INTERVAL '2 days'),
        ($1, 'message', 'Nouveau message de Dr. Bennett', 'N''oubliez pas votre rendez-vous de demain.', false, NOW() - INTERVAL '3 hours')
      ON CONFLICT DO NOTHING;
    `, [userId]);

    console.log("Seeding completed successfully ✅");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seedData();
