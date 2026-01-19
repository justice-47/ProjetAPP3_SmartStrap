const pool = require('../src/config/db');

async function initMessaging() {
  const client = await pool.connect();
  try {
    console.log("Creating messages and notifications tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- e.g., 'message', 'alert', 'system'
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data JSONB DEFAULT '{}'
      );
    `);

    console.log("Tables created successfully ✅");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.release();
    pool.end();
  }
}

initMessaging();
