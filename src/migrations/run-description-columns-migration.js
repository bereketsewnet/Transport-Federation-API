// src/migrations/run-description-columns-migration.js
// Run this script to add description_en and description_am columns to about_content table

const sequelize = require('../config/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('\n🚀 Adding description columns to about_content table...\n');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'about_content' 
        AND COLUMN_NAME IN ('description_en', 'description_am')
    `);
    
    const hasDescriptionEn = results.find(r => r.COLUMN_NAME === 'description_en');
    const hasDescriptionAm = results.find(r => r.COLUMN_NAME === 'description_am');
    
    if (hasDescriptionEn && hasDescriptionAm) {
      console.log('✅ Columns description_en and description_am already exist');
      await sequelize.close();
      process.exit(0);
    }
    
    // Add description_en if it doesn't exist (after vision_am)
    if (!hasDescriptionEn) {
      await sequelize.query(`
        ALTER TABLE about_content 
        ADD COLUMN description_en TEXT NULL AFTER vision_am
      `);
      console.log('✅ Added description_en column');
    }
    
    // Add description_am if it doesn't exist (after description_en or vision_am)
    if (!hasDescriptionAm) {
      const afterColumn = hasDescriptionEn ? 'description_en' : 'vision_am';
      await sequelize.query(`
        ALTER TABLE about_content 
        ADD COLUMN description_am TEXT NULL AFTER ${afterColumn}
      `);
      console.log('✅ Added description_am column');
    }
    
    console.log('\n✅ Successfully added description columns');
    console.log('\n📝 Columns added:');
    console.log('   - description_en (TEXT, nullable)');
    console.log('   - description_am (TEXT, nullable)');
    
  } catch (error) {
    // Check if error is because columns already exist
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Columns already exist (this is okay)');
    } else {
      console.error('❌ Failed to add columns:', error.message);
      console.error(error);
      throw error;
    }
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

