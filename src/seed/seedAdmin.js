// src/seed/seedAdmin.js
const sequelize = require('../config/db');
const LoginAccount = require('../models/loginAccount.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // careful in prod
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123!';
    const existing = await LoginAccount.findOne({ where: { username } });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }
    const hash = await bcrypt.hash(password, 12);
    await LoginAccount.create({ username, password_hash: hash, role: 'admin', must_change_password: true });
    console.log('Admin user created:', username);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();


// Run node src/seed/seedAdmin.js once after DB and .env are prepared to create admin.