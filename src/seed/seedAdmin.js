// src/seed/seedAdmin.js
// Production-safe script to seed ONLY admin account
// Usage: node src/seed/seedAdmin.js
//
// Environment variables (optional):
// ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PHONE
//
// NOTE: This script is safe for production - it only creates/updates admin account
// It does NOT clear existing data or create test data

const sequelize = require('../config/db');
const LoginAccount = require('../models/loginAccount.model');
const Member = require('../models/member.model');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedAdmin() {
  try {
    console.log('🔐 Starting admin account seeding (production-safe)...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Admin credentials from env (or sensible defaults)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PHONE = process.env.ADMIN_PHONE || '0912345678';

    // Hash password
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Security question answers (for password recovery)
    // Default answers for admin (can be changed after first login)
    const answer1Hash = await bcrypt.hash('addis ababa', 12);
    const answer2Hash = await bcrypt.hash('smith', 12);
    const answer3Hash = await bcrypt.hash('fluffy', 12);

    // Begin transaction
    const t = await sequelize.transaction();

    try {
      // 1) Create or find admin member
      console.log('📋 Creating/finding admin member...');
      
      const timestamp = Date.now();
      const adminMemberData = {
        mem_uuid: uuidv4(),
        member_code: `ADMIN-${timestamp}-001`,
        first_name: 'Admin',
        father_name: 'Admin',
        surname: 'User',
        sex: 'Male',
        birthdate: new Date('1985-01-01'),
        education: 'Degree',
        phone: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        salary: 50000.00,
        registry_date: new Date(),
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      let adminMember;
      const existingMember = await Member.findOne({ 
        where: { email: ADMIN_EMAIL },
        transaction: t 
      });

      if (existingMember) {
        console.log(`⚠️  Member with email ${ADMIN_EMAIL} already exists (mem_id: ${existingMember.mem_id})`);
        adminMember = existingMember;
      } else {
        // Check if member_code already exists
        const existingByCode = await Member.findOne({ 
          where: { member_code: adminMemberData.member_code },
          transaction: t 
        });
        
        if (existingByCode) {
          // Generate new member_code if conflict
          adminMemberData.member_code = `ADMIN-${timestamp}-${Math.floor(Math.random() * 1000)}`;
        }

        adminMember = await Member.create(adminMemberData, { transaction: t });
        console.log(`✅ Created admin member (mem_id: ${adminMember.mem_id}, member_code: ${adminMember.member_code})`);
      }

      // 2) Create or update admin login account
      console.log('📋 Creating/updating admin login account...');
      
      const existingLogin = await LoginAccount.findOne({ 
        where: { username: ADMIN_USERNAME },
        transaction: t 
      });

      if (existingLogin) {
        // Update existing login account
        await existingLogin.update({
          mem_id: adminMember.mem_id,
          password_hash: adminPasswordHash,
          role: 'admin',
          must_change_password: 0, // Admin does NOT need to change password
          security_question_1_id: 4,
          security_answer_1_hash: answer1Hash,
          security_question_2_id: 2,
          security_answer_2_hash: answer2Hash,
          security_question_3_id: 3,
          security_answer_3_hash: answer3Hash,
          is_locked: false,
          password_reset_required: false
        }, { transaction: t });
        
        console.log(`✅ Updated existing login account "${ADMIN_USERNAME}"`);
      } else {
        // Create new login account
        await LoginAccount.create({
          mem_id: adminMember.mem_id,
          username: ADMIN_USERNAME,
          password_hash: adminPasswordHash,
          must_change_password: 0, // Admin does NOT need to change password
          role: 'admin',
          security_question_1_id: 4,
          security_answer_1_hash: answer1Hash,
          security_question_2_id: 2,
          security_answer_2_hash: answer2Hash,
          security_question_3_id: 3,
          security_answer_3_hash: answer3Hash,
          is_locked: false,
          password_reset_required: false,
          created_at: new Date(),
        }, { transaction: t });
        
        console.log(`✅ Created login account "${ADMIN_USERNAME}"`);
      }

      await t.commit();
      console.log('\n🎉 ============================================');
      console.log('🎉   ADMIN ACCOUNT SEEDING COMPLETED!');
      console.log('🎉 ============================================\n');
      
      console.log('📝 Admin Account Details:');
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Phone: ${ADMIN_PHONE}`);
      console.log(`   Role: admin`);
      console.log(`   Status: ✅ Ready to login immediately (no password change required)\n`);
      
      console.log('🔐 Security Questions (Pre-set for password recovery):');
      console.log('   Question 1 (ID 4): "In what city were you born?" → Answer: "addis ababa"');
      console.log('   Question 2 (ID 2): "What is your mother\'s maiden name?" → Answer: "smith"');
      console.log('   Question 3 (ID 3): "What was the name of your first pet?" → Answer: "fluffy"');
      console.log('\n   ⚠️  Note: You can change these security questions after logging in.\n');
      
      console.log('✅ Admin account is ready for production use.\n');
      
      process.exit(0);
    } catch (err) {
      await t.rollback();
      console.error('❌ Transaction rolled back due to error:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
