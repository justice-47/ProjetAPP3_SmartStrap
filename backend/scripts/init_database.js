const db = require('../src/config/db');

async function initDatabase() {
  const client = await db.connect();
  
  try {
    console.log('🚀 Starting database initialization...\n');
    
    await client.query('BEGIN');

    // ============================================
    // 1. Create USERS table
    // ============================================
    console.log('📋 Creating table: users');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'medecin')),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table users created\n');

    // ============================================
    // 2. Create PATIENTS table
    // ============================================
    console.log('📋 Creating table: patients');
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        age INTEGER,
        contact_urgence VARCHAR(255),
        id_naissance DATE,
        medecin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        poids FLOAT,
        taille FLOAT,
        genre VARCHAR(20),
        antecedents TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table patients created\n');

    // ============================================
    // 3. Create MEDECINS table
    // ============================================
    console.log('📋 Creating table: medecins');
    await client.query(`
      CREATE TABLE IF NOT EXISTS medecins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        specialite VARCHAR(100),
        numero_ordre VARCHAR(50),
        hopital VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table medecins created\n');

    // ============================================
    // 4. Create HEART_RATE table
    // ============================================
    console.log('📋 Creating table: heart_rate');
    await client.query(`
      CREATE TABLE IF NOT EXISTS heart_rate (
        id SERIAL PRIMARY KEY,
        bpm INTEGER NOT NULL CHECK (bpm >= 0 AND bpm <= 300),
        measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table heart_rate created\n');

    // ============================================
    // 5. Create OXYGENE_RATE table
    // ============================================
    console.log('📋 Creating table: oxygene_rate');
    await client.query(`
      CREATE TABLE IF NOT EXISTS oxygene_rate (
        id SERIAL PRIMARY KEY,
        spo2 INTEGER NOT NULL CHECK (spo2 >= 0 AND spo2 <= 100),
        measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table oxygene_rate created\n');

    await client.query('COMMIT');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✓ users');
    console.log('   ✓ patients');
    console.log('   ✓ medecins');
    console.log('   ✓ heart_rate');
    console.log('   ✓ oxygene_rate');
    console.log('\n💡 Next step: Run "npm run db:seed" to add test data\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  } finally {
    client.release();
    await db.end();
  }
}

initDatabase();
