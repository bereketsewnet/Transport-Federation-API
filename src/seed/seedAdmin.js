// src/seed/seedAdmin.js

const sequelize = require('../config/db');
const LoginAccount = require('../models/loginAccount.model');
const Member = require('../models/member.model'); // ensure this path matches your project
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync(); // WARNING: avoid force: true in production
    console.log('Database synchronized.');

    // Admin credentials / member contact from env (or sensible defaults)
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPhone = process.env.ADMIN_PHONE || '0000000000';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 1) Ensure a member exists for the admin (use email as unique key)
    const [member, memberCreated] = await Member.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        first_name: 'Admin',
        father_name: 'Admin',
        surname: 'User',
        sex: 'M',
        phone: adminPhone,
        email: adminEmail,
        is_active: 1,
      },
    });

    console.log(
      memberCreated
        ? `Member created with mem_id=${member.mem_id}`
        : `Member found with mem_id=${member.mem_id}`
    );

    // 2) Create login account linked to member, or update existing
    const [login, loginCreated] = await LoginAccount.findOrCreate({
      where: { username },
      defaults: {
        mem_id: member.mem_id,
        username,
        password_hash: passwordHash,
        role: 'admin',
        must_change_password: true,
        is_locked: false,
      },
    });

    if (loginCreated) {
      console.log(`Login account "${username}" created and linked to mem_id=${member.mem_id}`);
    } else {
      console.log(`Login account "${username}" already exists.`);

      // If existing login isn't linked to this member, update it
      if (!login.mem_id || login.mem_id !== member.mem_id) {
        await login.update({ mem_id: member.mem_id });
        console.log(`Updated login "${username}" to link to mem_id=${member.mem_id}`);
      } else {
        console.log(`Login "${username}" is already linked to mem_id=${member.mem_id}`);
      }
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
