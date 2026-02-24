const pool = require('../src/config/db');

async function checkTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables found:", res.rows.map(r => r.table_name));
    
    // Check specific columns for oxygene_rate if it exists
    if (res.rows.find(r => r.table_name === 'oxygene_rate')) {
        const cols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'oxygene_rate'
        `);
        console.log("Columns in oxygene_rate:", cols.rows);
    }

  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    pool.end();
  }
}

checkTables();
