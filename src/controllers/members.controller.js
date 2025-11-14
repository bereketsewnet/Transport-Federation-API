// src/controllers/members.controller.js
const Member = require('../models/member.model');
const Archive = require('../models/archive.model');
const LoginAccount = require('../models/loginAccount.model');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.list = async (req, res) => {
  try {
    const { q, union_id, is_active, page=1, per_page=20, sort_by='created_at', order='DESC' } = req.query;
    const where = {};
    if (q) where[Op.or] = [
      { first_name: { [Op.like]: `%${q}%` } },
      { father_name: { [Op.like]: `%${q}%` } },
      { surname: { [Op.like]: `%${q}%` } },
      { member_code: { [Op.like]: `%${q}%` } }
    ];
    if (union_id) where.union_id = union_id;
    if (typeof is_active !== 'undefined') where.is_active = is_active === 'true' ? 1 : 0;
    const offset = (Math.max(1, parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await Member.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [[sort_by, order.toUpperCase()]] });
    res.json({ data: rows, meta: { total: count, page: parseInt(page), per_page: parseInt(per_page) }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try {
    const item = await Member.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Member not found' });
    
    // Also get login account info if exists
    const loginAccount = await LoginAccount.findOne({ 
      where: { mem_id: item.mem_id },
      attributes: { exclude: ['password_hash', 'security_answer_1_hash', 'security_answer_2_hash', 'security_answer_3_hash'] }
    });
    
    const response = item.toJSON();
    response.loginAccount = loginAccount;
    
    res.json(response);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    if (!req.body.first_name) return res.status(400).json({ message: 'first_name required' });
    
    // Generate member_code if not provided
    if (!req.body.member_code || req.body.member_code.trim() === '') {
      // Generate unique member_code: M-XXXXXXXX (8 random digits)
      let generatedCode;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!isUnique && attempts < maxAttempts) {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
        generatedCode = `M-${randomDigits}`;
        
        // Check if code already exists
        const existing = await Member.findOne({ where: { member_code: generatedCode } });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        return res.status(500).json({ message: 'Failed to generate unique member_code. Please try again.' });
      }
      
      req.body.member_code = generatedCode;
    } else {
      // Check if provided member_code already exists
      const existing = await Member.findOne({ where: { member_code: req.body.member_code } });
      if (existing) {
        return res.status(409).json({ message: `Member with code '${req.body.member_code}' already exists. Please use a different code.` });
      }
    }
    
    // set mem_uuid if not set
    if (!req.body.mem_uuid) req.body.mem_uuid = uuidv4();
    
    // Create member
    const created = await Member.create(req.body);
    
    // Automatically create login account for the member
    // Generate username from member_code or email
    let username = req.body.member_code;
    if (!username && req.body.email) {
      username = req.body.email.split('@')[0];
    }
    if (!username) {
      username = `member_${created.mem_id}`;
    }
    
    // Generate default password (member code or phone last 6 digits)
    let defaultPassword = req.body.member_code || req.body.phone?.slice(-6) || '123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    
    // Create login account
    const loginAccount = await LoginAccount.create({
      mem_id: created.mem_id,
      username: username,
      password_hash: passwordHash,
      role: 'member',
      must_change_password: true, // Force password change on first login
      password_reset_required: false
    });
    
    // Return member with login credentials
    const response = created.toJSON();
    response.loginCredentials = {
      username: loginAccount.username,
      defaultPassword: defaultPassword,
      message: 'Login account created. User must change password and set security questions on first login.'
    };
    
    res.status(201).json(response);
  } catch (err) { 
    console.error(err); 
    res.status(400).json({ message: err.message }); 
  }
};

exports.update = async (req,res) => {
  try {
    const found = await Member.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Member not found' });
    
    // If member_code is being updated, check for duplicates
    if (req.body.member_code && req.body.member_code !== found.member_code) {
      const existing = await Member.findOne({ 
        where: { 
          member_code: req.body.member_code,
          mem_id: { [Op.ne]: found.mem_id } // Exclude current member
        } 
      });
      if (existing) {
        return res.status(409).json({ message: `Member with code '${req.body.member_code}' already exists. Please use a different code.` });
      }
    }
    
    await found.update(req.body);
    res.json(found);
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.remove = async (req,res) => {
  try {
    const { confirm, archive } = req.query;
    const id = req.params.id;
    const found = await Member.findByPk(id);
    if (!found) return res.status(404).json({ message: 'Member not found' });

    if (archive === 'true') {
      // move snapshot to archives
      const archivedRecord = await Archive.create({
        mem_id: found.mem_id,
        union_id: found.union_id,
        member_code: found.member_code,
        first_name: found.first_name,
        father_name: found.father_name,
        surname: found.surname,
        sex: found.sex,
        birthdate: found.birthdate,
        education: found.education,
        phone: found.phone,
        email: found.email,
        salary: found.salary,
        registry_date: found.registry_date,
        resigned_date: req.body?.resigned_date ? new Date(req.body.resigned_date) : new Date(),
        reason: req.body?.reason || 'Archived via API'
      });
      await found.destroy();
      return res.json({ 
        message: 'Member archived',
        archive: archivedRecord.toJSON()
      });
    }

    if (confirm === 'true') {
      // Delete related records first
      // Delete login account if exists
      await LoginAccount.destroy({ where: { mem_id: found.mem_id } });
      
      // Delete union executives if member is an executive (using member_code)
      const UnionExecutive = require('../models/unionExecutive.model');
      if (found.member_code) {
        await UnionExecutive.destroy({ where: { member_code: found.member_code } });
      }
      
      // Now delete the member
      await found.destroy();
      return res.json({ message: 'Member deleted' });
    }
    return res.status(400).json({ message: 'Deletion requires ?confirm=true or archive=true' });
  } catch (err) { 
    console.error('Delete member error:', err); 
    res.status(500).json({ message: err.message || 'Server error' }); 
  }
};
