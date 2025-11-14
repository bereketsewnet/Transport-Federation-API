// src/migrations/run-sectors-organizations-migration.js
// Run this script to create sectors and organizations tables

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\nCreating sectors and organizations tables...');
    
    // Check if sectors table exists
    const [sectorsCheck] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'sectors'
    `);

    if (sectorsCheck.length === 0) {
      console.log('Creating sectors table...');
      await sequelize.query(`
        CREATE TABLE sectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ Created sectors table');
    } else {
      console.log('⚠️  sectors table already exists. Skipping.');
    }

    // Check if organizations table exists
    const [orgsCheck] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'organizations'
    `);

    if (orgsCheck.length === 0) {
      console.log('Creating organizations table...');
      await sequelize.query(`
        CREATE TABLE organizations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ Created organizations table');
    } else {
      console.log('⚠️  organizations table already exists. Skipping.');
    }

    // Seed sectors if table is empty
    const [sectorsCount] = await sequelize.query(`SELECT COUNT(*) as count FROM sectors`);
    if (sectorsCount[0].count === 0) {
      console.log('\nSeeding sectors...');
      const sectors = [
        'Aviation',
        'Road transport',
        'Urban transport',
        'Railway',
        'Inland transport',
        'Maritime',
        'Communication'
      ];
      for (const sectorName of sectors) {
        await sequelize.query(`INSERT INTO sectors (name) VALUES (?)`, { replacements: [sectorName] });
      }
      console.log(`✅ Seeded ${sectors.length} sectors`);
    } else {
      console.log(`⚠️  sectors table already has ${sectorsCount[0].count} records. Skipping seed.`);
    }

    // Seed organizations if table is empty
    const [orgsCount] = await sequelize.query(`SELECT COUNT(*) as count FROM organizations`);
    if (orgsCount[0].count === 0) {
      console.log('Seeding organizations...');
      const organizations = [
        'Ethiopian Airlines Group',
        'Ethiopian Maritime Transport and Logistics',
        'Addis Ababa City Bus Service Enterprise',
        'Ethio Telecom',
        'Ethiopia Posta',
        'Public Service Transport',
        'DHL World Wide Express Ethiopia',
        'Ethiopian Tool Road Enterprise',
        'International Cargo and Aviation Service',
        'ISON Experience Ethio call PLC',
        'Moti Engineering P.L.C',
        'Addis Ababa Light Railway Transport Service Enterprise',
        'East West Ethio Transport PLC',
        'Abyssinia Transport S/C',
        'Bekelcha Transport S/C',
        'Geda Transport S/C',
        'Selam Bus Public Transport PLC',
        'Ethiopian Railway Corporation',
        'Dire Dawa Dewele Railway',
        'Trans Ethiopia PLC',
        'Demtsu Woyan',
        'Bahir Dar Public Service Transport',
        'Hararge Anestgn Melestegn Public Transport',
        'Hararge Keftegn Public Transport',
        'Kinfe Rufael Geda',
        'Tekur Abay Transport S/C',
        'National Transport',
        'Elet Derash Erdata Transport',
        'Derba Transport S/C',
        'Hohot Transport',
        'Ethiopian Maritime Training Institute',
        'Adama Drivers Training Institute'
      ];
      for (const orgName of organizations) {
        await sequelize.query(`INSERT INTO organizations (name) VALUES (?)`, { replacements: [orgName] });
      }
      console.log(`✅ Seeded ${organizations.length} organizations`);
    } else {
      console.log(`⚠️  organizations table already has ${orgsCount[0].count} records. Skipping seed.`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

