// Run CMS database migrations
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tcwf_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting CMS database migration...');
    
    // Read and execute table creation script
    const createTablesPath = path.join(__dirname, '01_create_cms_tables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    
    console.log('📋 Creating CMS tables...');
    await client.query(createTablesSQL);
    console.log('✅ CMS tables created successfully');
    
    // Read and execute default data script
    const insertDataPath = path.join(__dirname, '02_insert_default_cms_data.sql');
    const insertDataSQL = fs.readFileSync(insertDataPath, 'utf8');
    
    console.log('📊 Inserting default CMS data...');
    await client.query(insertDataSQL);
    console.log('✅ Default CMS data inserted successfully');
    
    // Verify tables and data
    console.log('🔍 Verifying migration...');
    
    const homeCount = await client.query('SELECT COUNT(*) FROM home_content');
    const aboutCount = await client.query('SELECT COUNT(*) FROM about_content');
    const executivesCount = await client.query('SELECT COUNT(*) FROM executives');
    const contactCount = await client.query('SELECT COUNT(*) FROM contact_info');
    
    console.log(`📈 Migration Results:`);
    console.log(`   - home_content: ${homeCount.rows[0].count} row(s)`);
    console.log(`   - about_content: ${aboutCount.rows[0].count} row(s)`);
    console.log(`   - executives: ${executivesCount.rows[0].count} row(s)`);
    console.log(`   - contact_info: ${contactCount.rows[0].count} row(s)`);
    
    console.log('🎉 CMS migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = runMigration;
