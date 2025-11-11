// src/controllers/archives.controller.js
const Archive = require('../models/archive.model');
const Member = require('../models/member.model');
const LoginAccount = require('../models/loginAccount.model');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.list = async (req,res) => {
  try {
    const { q, page=1, per_page=20 } = req.query;
    const where = {};
    if (q) where.first_name = { [Op.like]: `%${q}%` };
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await Archive.findAndCountAll({ where, limit: parseInt(per_page), offset });
    res.json({ data: rows, meta: { total: count }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try { const item = await Archive.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); res.json(item); }
  catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
};

exports.create = async (req,res) => {
  try { const created = await Archive.create(req.body); res.status(201).json(created); }
  catch(err){ console.error(err); res.status(400).json({message:err.message}); }
};

exports.remove = async (req,res) => {
  try { if(req.query.confirm !== 'true') return res.status(400).json({message:'To delete set ?confirm=true'}); const found = await Archive.findByPk(req.params.id); if(!found) return res.status(404).json({message:'Not found'}); await found.destroy(); res.json({message:'Deleted'}); }
  catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
};

exports.restore = async (req, res) => {
  try {
    const archiveId = req.params.id;
    const archivedRecord = await Archive.findByPk(archiveId);
    if (!archivedRecord) {
      return res.status(404).json({ message: 'Archive not found' });
    }

    // Prevent duplicate member_code reactivation
    const existingMember = await Member.findOne({ where: { member_code: archivedRecord.member_code } });
    if (existingMember) {
      return res.status(409).json({ message: 'Member with this member_code already exists. Please update member_code before restoring.' });
    }

    const now = new Date();
    const restoredMember = await Member.create({
      union_id: archivedRecord.union_id,
      member_code: archivedRecord.member_code,
      first_name: archivedRecord.first_name,
      father_name: archivedRecord.father_name,
      surname: archivedRecord.surname,
      sex: archivedRecord.sex,
      birthdate: archivedRecord.birthdate,
      education: archivedRecord.education,
      phone: archivedRecord.phone,
      email: archivedRecord.email,
      salary: archivedRecord.salary,
      registry_date: archivedRecord.registry_date,
      mem_uuid: uuidv4(),
      is_active: true,
      created_at: now,
      updated_at: now
    });

    // Re-create login account with default credentials
    let username = restoredMember.member_code;
    if (!username && restoredMember.email) {
      username = restoredMember.email.split('@')[0];
    }
    if (!username) {
      username = `member_${restoredMember.mem_id}`;
    }

    let defaultPassword = restoredMember.member_code || restoredMember.phone?.slice(-6) || '123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    await LoginAccount.create({
      mem_id: restoredMember.mem_id,
      username,
      password_hash: passwordHash,
      role: 'member',
      must_change_password: true,
      password_reset_required: false
    });

    // Delete the archive record after successful restore
    await archivedRecord.destroy();

    res.json({
      message: 'Member restored from archive',
      member: restoredMember,
      loginCredentials: {
        username,
        defaultPassword,
        message: 'Login account recreated. User must change password and set security questions on first login.'
      }
    });
  } catch (err) {
    console.error('Archive restore error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
