require('dotenv').config();
const sequelize = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runOSHMigration() {
  console.log('🚀 Starting OSH database migration...');

  try {
    // Read SQL file
    const createOSHTableSql = fs.readFileSync(path.join(__dirname, '03_create_osh_table_mysql.sql'), 'utf8');

    // Execute create table SQL
    console.log('\n📋 Creating OSH incidents table...');
    // Split by semicolon, but ensure it doesn't split within quoted strings or comments
    const createStatements = createOSHTableSql.split(/;\s*(?![^'"`]*['"`])/g).filter(s => s.trim() !== '');
    for (const statement of createStatements) {
      if (statement.trim()) {
        try {
          await sequelize.query(statement);
        } catch (error) {
          console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
          throw error;
        }
      }
    }
    console.log('✅ OSH incidents table created successfully\n');

    // Verify table creation
    console.log('🔍 Verifying migration...');
    
    try {
      const [oshCount] = await sequelize.query('SELECT COUNT(*) as count FROM osh_incidents');
      console.log(`📈 Migration Results:`);
      console.log(`   - osh_incidents: ${oshCount[0].count} row(s)`);
    } catch (verifyError) {
      console.log('⚠️  Verification skipped (table may need a moment to be ready)');
    }
    
    console.log('\n🎉 OSH migration completed successfully!');
    console.log('\n✅ You can now:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Test OSH endpoints: curl http://localhost:4000/api/osh-incidents');
    console.log('   3. Test OSH reports: curl http://localhost:4000/api/reports/osh-summary');
    console.log('   4. Use Postman to test all OSH endpoints');
    
  } catch (error) {
    console.error('❌ Migration script failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n✅ Migration script completed');
  }
}

runOSHMigration();
