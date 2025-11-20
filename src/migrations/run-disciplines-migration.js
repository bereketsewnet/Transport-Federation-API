// src/migrations/run-disciplines-migration.js
// Run this script to create the disciplines table

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\n🚀 Creating disciplines table...\n');
    
    // Check if table already exists
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'disciplines'
    `);
    
    if (results.length > 0) {
      console.log('⚠️  Table disciplines already exists. Skipping migration.');
      await sequelize.close();
      process.exit(0);
    }
    
    // Create disciplines table
    await sequelize.query(`
      CREATE TABLE disciplines (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        union_id INT NOT NULL,
        mem_id INT NOT NULL,
        discipline_case ENUM('Warning', 'Salary Penalty', 'Work Suspension', 'Termination') NOT NULL,
        reason_of_discipline TEXT NOT NULL,
        date_of_action_taken DATE NOT NULL,
        judiciary_intermediate TINYINT(1) NOT NULL DEFAULT 0,
        resolution_method ENUM('Social Dialog', 'Judiciary Body'),
        verdict_for ENUM('Worker', 'Employer'),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (union_id) REFERENCES unions(union_id) ON DELETE CASCADE,
        FOREIGN KEY (mem_id) REFERENCES members(mem_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created disciplines table');
    
    // Create indexes
    await sequelize.query(`CREATE INDEX idx_disciplines_union ON disciplines(union_id)`);
    console.log('✅ Created index on union_id');
    
    await sequelize.query(`CREATE INDEX idx_disciplines_member ON disciplines(mem_id)`);
    console.log('✅ Created index on mem_id');
    
    console.log('\n✅ Successfully created disciplines table and indexes');
    
  } catch (error) {
    console.error('❌ Failed to create table:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

