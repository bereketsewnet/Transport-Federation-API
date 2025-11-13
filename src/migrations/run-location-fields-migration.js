// src/migrations/run-location-fields-migration.js
// Run this script to add location fields (region, zone, city, sub_city, woreda, location_area) to unions table

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\nAdding location fields to unions table...');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'unions' 
        AND COLUMN_NAME IN ('region', 'zone', 'city', 'sub_city', 'woreda', 'location_area')
    `);

    const existingColumns = results.map(r => r.COLUMN_NAME);
    const allColumns = ['region', 'zone', 'city', 'sub_city', 'woreda', 'location_area'];
    const missingColumns = allColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('⚠️  All location columns already exist. Skipping migration.');
      process.exit(0);
    }

    console.log(`Adding columns: ${missingColumns.join(', ')}`);

    // Add columns one by one
    if (!existingColumns.includes('region')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN region VARCHAR(100) NULL AFTER external_audit_date
      `);
      console.log('✅ Added region column');
    }

    if (!existingColumns.includes('zone')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN zone VARCHAR(100) NULL AFTER region
      `);
      console.log('✅ Added zone column');
    }

    if (!existingColumns.includes('city')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN city VARCHAR(100) NULL AFTER zone
      `);
      console.log('✅ Added city column');
    }

    if (!existingColumns.includes('sub_city')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN sub_city VARCHAR(100) NULL AFTER city
      `);
      console.log('✅ Added sub_city column');
    }

    if (!existingColumns.includes('woreda')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN woreda VARCHAR(100) NULL AFTER sub_city
      `);
      console.log('✅ Added woreda column');
    }

    if (!existingColumns.includes('location_area')) {
      await sequelize.query(`
        ALTER TABLE unions 
        ADD COLUMN location_area VARCHAR(255) NULL AFTER woreda
      `);
      console.log('✅ Added location_area column');
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

