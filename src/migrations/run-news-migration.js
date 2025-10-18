// src/migrations/run-news-migration.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tcwf_db',
    multipleStatements: true
  });

  try {
    console.log('Running news image migration...');
    const sqlFile = path.join(__dirname, 'add_image_to_news.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await connection.query(sql);
    console.log('✓ News image migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();

