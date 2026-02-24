const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const client = await db.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await client.query('BEGIN');

    // ============================================
    // 1. Create Test Users
    // ============================================
    console.log('👤 Creating test users...');
    
    const password = await bcrypt.hash('Password123!', 10);
    
    // Patient 1
    const user1 = await client.query(`
      INSERT INTO users (nom, prenom, email, password, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Dupont', 'Marie', 'marie.dupont@example.com', password, 'patient', '0612345678']);
    
    const userId1 = user1.rows[0].id;
    console.log(`   ✓ Patient created: Marie Dupont (ID: ${userId1})`);

    // Patient 2
    const user2 = await client.query(`
      INSERT INTO users (nom, prenom, email, password, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Martin', 'Jean', 'jean.martin@example.com', password, 'patient', '0623456789']);
    
    const userId2 = user2.rows[0].id;
    console.log(`   ✓ Patient created: Jean Martin (ID: ${userId2})`);

    // Medecin
    const user3 = await client.query(`
      INSERT INTO users (nom, prenom, email, password, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Leblanc', 'Sophie', 'dr.leblanc@example.com', password, 'medecin', '0634567890']);
    
    const userId3 = user3.rows[0].id;
    console.log(`   ✓ Médecin created: Dr. Sophie Leblanc (ID: ${userId3})\n`);

    // ============================================
    // 2. Create Patient Profiles
    // ============================================
    console.log('📋 Creating patient profiles...');
    
    const patient1 = await client.query(`
      INSERT INTO patients (user_id, nom, prenom, age, contact_urgence, id_naissance, medecin_id, poids, taille, genre, antecedents)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [userId1, 'Dupont', 'Marie', 35, '0698765432', '1989-05-15', userId3, 65.5, 1.68, 'Femme', 'Hypertension, Asthme']);
    
    const patientId1 = patient1.rows[0].id;
    console.log(`   ✓ Profile for Marie Dupont (Patient ID: ${patientId1})`);
 
    const patient2 = await client.query(`
      INSERT INTO patients (user_id, nom, prenom, age, contact_urgence, id_naissance, medecin_id, poids, taille, genre, antecedents)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [userId2, 'Martin', 'Jean', 42, '0687654321', '1982-11-20', userId3, 78.0, 1.75, 'Homme', 'Diabète type 2']);
    
    const patientId2 = patient2.rows[0].id;
    console.log(`   ✓ Profile for Jean Martin (Patient ID: ${patientId2})\n`);

    // ============================================
    // 3. Create Doctor Profile
    // ============================================
    console.log('👨‍⚕️ Creating doctor profile...');
    
    await client.query(`
      INSERT INTO medecins (user_id, specialite, numero_ordre, hopital)
      VALUES ($1, $2, $3, $4)
    `, [userId3, 'Cardiologie', 'RPPS123456789', 'CHU de Paris']);
    
    console.log('   ✓ Profile for Dr. Sophie Leblanc\n');

    // ============================================
    // 4. Insert Heart Rate Data (last 24 hours)
    // ============================================
    console.log('💓 Inserting heart rate measurements...');
    
    const heartRateData = [];
    for (let i = 0; i < 24; i++) {
      const bpm = Math.floor(Math.random() * (85 - 60) + 60); // Random between 60-85
      const hoursAgo = 23 - i;
      heartRateData.push(`(${bpm}, NOW() - INTERVAL '${hoursAgo} hours', ${patientId1})`);
    }
    
    await client.query(`
      INSERT INTO heart_rate (bpm, measured_at, patient_id)
      VALUES ${heartRateData.join(', ')}
    `);
    
    console.log(`   ✓ Inserted 24 heart rate measurements\n`);

    // ============================================
    // 5. Insert Oxygen Saturation Data (last 24 hours)
    // ============================================
    console.log('🫁 Inserting oxygen saturation measurements...');
    
    const oxygenData = [];
    for (let i = 0; i < 24; i++) {
      const spo2 = Math.floor(Math.random() * (100 - 95) + 95); // Random between 95-100
      const hoursAgo = 23 - i;
      oxygenData.push(`(${spo2}, NOW() - INTERVAL '${hoursAgo} hours', ${patientId1})`);
    }
    
    await client.query(`
      INSERT INTO oxygene_rate (spo2, measured_at, patient_id)
      VALUES ${oxygenData.join(', ')}
    `);
    
    console.log(`   ✓ Inserted 24 oxygen saturation measurements\n`);

    await client.query('COMMIT');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Accounts Created:');
    console.log('   Patient 1:');
    console.log('      Email: marie.dupont@example.com');
    console.log('      Password: Password123!');
    console.log('   Patient 2:');
    console.log('      Email: jean.martin@example.com');
    console.log('      Password: Password123!');
    console.log('   Médecin:');
    console.log('      Email: dr.leblanc@example.com');
    console.log('      Password: Password123!');
    console.log('\n💡 You can now test your API endpoints!\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    client.release();
    await db.end();
  }
}

seedDatabase();
