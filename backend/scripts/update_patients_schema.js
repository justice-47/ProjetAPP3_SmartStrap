const db = require('../src/config/db');

async function updatePatientsSchema() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    console.log("Adding columns to 'patients' table...");

    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS poids FLOAT,
      ADD COLUMN IF NOT EXISTS taille FLOAT,
      ADD COLUMN IF NOT EXISTS genre VARCHAR(20),
      ADD COLUMN IF NOT EXISTS antecedents TEXT;
    `);

    await client.query('COMMIT');
    console.log("✅ 'patients' table updated successfully.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Error updating 'patients' table:", error);
  } finally {
    client.release();
    process.exit();
  }
}

updatePatientsSchema();
