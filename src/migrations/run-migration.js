// src/migrations/run-migration.js
// Run this script to add is_local column to photos table

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\nAdding is_local column to photos table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'photos' 
        AND COLUMN_NAME = 'is_local'
    `);

    if (results.length > 0) {
      console.log('⚠️  Column is_local already exists. Skipping migration.');
      process.exit(0);
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE photos 
      ADD COLUMN is_local BOOLEAN DEFAULT FALSE 
      COMMENT 'TRUE for uploaded files, FALSE for external URLs'
      AFTER taken_at
    `);
    
    console.log('✅ Column is_local added successfully');

    // Update existing records to FALSE (assume they are URLs)
    await sequelize.query(`
      UPDATE photos 
      SET is_local = FALSE 
      WHERE is_local IS NULL
    `);
    
    console.log('✅ Existing records updated');
    console.log('\n🎉 Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

