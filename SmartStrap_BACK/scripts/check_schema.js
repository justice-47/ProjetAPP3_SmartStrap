const pool = require('../src/config/db');

async function checkSchema() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

checkSchema();
