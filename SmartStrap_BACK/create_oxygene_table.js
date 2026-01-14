const pool = require('./src/config/db');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS oxygene_rate (
        id SERIAL PRIMARY KEY,
        spo2 INTEGER NOT NULL,  -- using bpm to match controller, though spo2 would be better
        measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log("Table oxygene_rate created successfully.");
    
    // Insert some dummy data
    const insert = `
        INSERT INTO oxygene_rate (spo2, measured_at) VALUES 
        (98, NOW()),
        (97, NOW() - INTERVAL '1 hour'),
        (99, NOW() - INTERVAL '2 hours')
    `;
    await pool.query(insert);
    console.log("Dummy data inserted.");

  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    pool.end();
  }
}

createTable();
