// src/migrations/run-union-executives-member-code-migration.js
// Run this script to migrate union_executives from mem_id to member_code

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\nMigrating union_executives from mem_id to member_code...');
    
    // Check if member_code column already exists
    const [columnCheck] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'union_executives' 
        AND COLUMN_NAME = 'member_code'
    `);

    if (columnCheck.length > 0) {
      console.log('⚠️  member_code column already exists. Checking if migration is needed...');
      
      // Check if mem_id column still exists
      const [memIdCheck] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'union_executives' 
          AND COLUMN_NAME = 'mem_id'
      `);
      
      if (memIdCheck.length === 0) {
        console.log('✅ Migration already completed. mem_id column removed.');
        process.exit(0);
      }
    } else {
      // Add member_code column
      console.log('Adding member_code column...');
      await sequelize.query(`
        ALTER TABLE union_executives 
        ADD COLUMN member_code VARCHAR(100) NULL AFTER union_id
      `);
      console.log('✅ Added member_code column');
    }

    // Migrate data: copy member_code from members table based on mem_id
    console.log('Migrating data from mem_id to member_code...');
    const [migrationResult] = await sequelize.query(`
      UPDATE union_executives ue
      INNER JOIN members m ON ue.mem_id = m.mem_id
      SET ue.member_code = m.member_code
      WHERE ue.mem_id IS NOT NULL 
        AND m.member_code IS NOT NULL
        AND ue.member_code IS NULL
    `);
    console.log(`✅ Migrated ${migrationResult.affectedRows || 0} records`);

    // Check for any records that couldn't be migrated
    const [unmigrated] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM union_executives 
      WHERE mem_id IS NOT NULL 
        AND member_code IS NULL
    `);
    
    if (unmigrated[0].count > 0) {
      console.log(`⚠️  Warning: ${unmigrated[0].count} records have mem_id but no corresponding member_code. These will be set to NULL.`);
    }

    // Remove foreign key constraint on mem_id if it exists
    console.log('Removing foreign key constraint on mem_id...');
    try {
      await sequelize.query(`
        ALTER TABLE union_executives 
        DROP FOREIGN KEY union_executives_ibfk_2
      `);
      console.log('✅ Removed foreign key constraint');
    } catch (err) {
      // Foreign key might have a different name or not exist
      console.log('⚠️  Could not remove foreign key (may not exist or have different name):', err.message);
    }

    // Remove mem_id column
    console.log('Removing mem_id column...');
    await sequelize.query(`
      ALTER TABLE union_executives 
      DROP COLUMN mem_id
    `);
    console.log('✅ Removed mem_id column');
    
    console.log('\n🎉 Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

