// src/migrations/run-security-migration.js
// Run this script to add security questions fields to login_accounts table

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    console.log('Starting security questions migration...\n');

    // Check if security_question_1_id already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'login_accounts' 
        AND COLUMN_NAME = 'security_question_1_id'
    `);

    if (results.length > 0) {
      console.log('⚠️  Security questions columns already exist. Skipping migration.');
      process.exit(0);
    }

    // Drop old columns if they exist
    console.log('1. Removing old security question fields...');
    try {
      await sequelize.query(`ALTER TABLE login_accounts DROP COLUMN IF EXISTS security_question`);
      await sequelize.query(`ALTER TABLE login_accounts DROP COLUMN IF EXISTS security_answer_hash`);
      console.log('   ✅ Old fields removed');
    } catch (err) {
      console.log('   ℹ️  Old fields don\'t exist, continuing...');
    }

    // Add new security question fields
    console.log('2. Adding security question fields (3 questions)...');
    await sequelize.query(`
      ALTER TABLE login_accounts 
      ADD COLUMN security_question_1_id INT AFTER must_change_password,
      ADD COLUMN security_answer_1_hash TEXT AFTER security_question_1_id,
      ADD COLUMN security_question_2_id INT AFTER security_answer_1_hash,
      ADD COLUMN security_answer_2_hash TEXT AFTER security_question_2_id,
      ADD COLUMN security_question_3_id INT AFTER security_answer_2_hash,
      ADD COLUMN security_answer_3_hash TEXT AFTER security_question_3_id
    `);
    console.log('   ✅ Security question fields added');

    // Add password reset flag
    console.log('3. Adding password_reset_required flag...');
    await sequelize.query(`
      ALTER TABLE login_accounts 
      ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE 
      COMMENT 'Set to TRUE when admin resets password'
      AFTER is_locked
    `);
    console.log('   ✅ Password reset flag added');

    console.log('\n🎉 Security questions migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Users will be prompted to set security questions on first login');
    console.log('  2. Users can reset password using 3 security questions');
    console.log('  3. Admin can reset user passwords (triggers password change requirement)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();

