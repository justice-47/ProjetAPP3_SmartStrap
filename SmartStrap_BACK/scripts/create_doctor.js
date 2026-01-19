const pool = require('../src/config/db');

async function createDoctor() {
  const client = await pool.connect();
  try {
    console.log("Creating doctor user...");
    await client.query(`
      INSERT INTO users (id, nom, prenom, email, password, role)
      VALUES (999, 'Bennett', 'Alexander', 'dr.bennett@smartstrap.com', 'password123', 'doctor')
      ON CONFLICT (id) DO UPDATE SET nom = EXCLUDED.nom
    `);
    console.log("Doctor user created successfully ✅");
  } catch (err) {
    console.error("Error creating doctor:", err);
  } finally {
    client.release();
    pool.end();
  }
}

createDoctor();
