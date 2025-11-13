// src/controllers/loginAccounts.controller.js
const LoginAccount = require('../models/loginAccount.model');
const Member = require('../models/member.model');
const bcrypt = require('bcryptjs');

exports.list = async (req,res) => {
  try {
    const { q, page=1, per_page=20 } = req.query;
    const where = {};
    if (q) where.username = { [require('sequelize').Op.like]: `%${q}%` };
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await LoginAccount.findAndCountAll({ where, attributes: { exclude: ['password_hash', 'security_answer_hash'] }, limit: parseInt(per_page), offset });
    res.json({ data: rows, meta: { total: count }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try {
    const item = await LoginAccount.findByPk(req.params.id, { attributes: { exclude: ['password_hash', 'security_answer_hash'] }});
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    const { username, password, role='member' } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });
    const hash = await bcrypt.hash(password, 12);
    const created = await LoginAccount.create({ username, password_hash: hash, role, must_change_password: true });
    res.status(201).json({ id: created.id, username: created.username, role: created.role });
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.update = async (req,res) => {
  try {
    const found = await LoginAccount.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    // never allow updating password directly here without hashing
    if (req.body.password) {
      found.password_hash = await bcrypt.hash(req.body.password, 12);
      delete req.body.password;
    }
    Object.assign(found, req.body);
    await found.save();
    res.json({ id: found.id, username: found.username, role: found.role });
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.resetPassword = async (req,res) => {
  try {
    const found = await LoginAccount.findOne({ where: { username: req.params.username }});
    if (!found) return res.status(404).json({ message: 'Not found' });
    const newPass = req.body.password;
    if (!newPass) return res.status(400).json({ message: 'password required' });
    if (newPass.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    
    found.password_hash = await bcrypt.hash(newPass, 12);
    found.must_change_password = true;
    found.password_reset_required = true; // Flag for admin reset
    await found.save();
    
    res.json({ 
      message: 'Password reset successfully. User will be required to change password and set security questions on next login.',
      username: found.username
    });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.lockUnlock = async (req,res) => {
  try {
    const found = await LoginAccount.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    found.is_locked = req.body.is_locked === true || req.body.is_locked === 'true';
    await found.save();
    res.json({ message: `Account ${found.is_locked ? 'locked' : 'unlocked'}` });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.resetPasswordByMemberId = async (req, res) => {
  try {
    const { mem_id } = req.params;
    if (!mem_id) return res.status(400).json({ message: 'mem_id parameter required' });

    // Find member by mem_id
    const member = await Member.findByPk(mem_id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (!member.member_code) {
      return res.status(400).json({ message: 'Member does not have a member_code. Cannot reset to default credentials.' });
    }

    // Find or create login account for this member
    let loginAccount = await LoginAccount.findOne({ where: { mem_id: member.mem_id } });
    
    if (!loginAccount) {
      // Create new login account if it doesn't exist
      const defaultPasswordHash = await bcrypt.hash(member.member_code, 12);
      loginAccount = await LoginAccount.create({
        mem_id: member.mem_id,
        username: member.member_code,
        password_hash: defaultPasswordHash,
        role: 'member',
        must_change_password: true,
        password_reset_required: true,
        security_question_1_id: null,
        security_answer_1_hash: null,
        security_question_2_id: null,
        security_answer_2_hash: null,
        security_question_3_id: null,
        security_answer_3_hash: null
      });
    } else {
      // Reset existing account to defaults
      const defaultPasswordHash = await bcrypt.hash(member.member_code, 12);
      
      // Check if username needs to be changed (handle unique constraint)
      if (loginAccount.username !== member.member_code) {
        // Temporarily set username to unique value, then update to member_code
        const tempUsername = `${member.member_code}_temp_${Date.now()}`;
        loginAccount.username = tempUsername;
        await loginAccount.save();
      }
      
      loginAccount.username = member.member_code;
      loginAccount.password_hash = defaultPasswordHash;
      loginAccount.must_change_password = true;
      loginAccount.password_reset_required = true;
      
      // Clear all security questions
      loginAccount.security_question_1_id = null;
      loginAccount.security_answer_1_hash = null;
      loginAccount.security_question_2_id = null;
      loginAccount.security_answer_2_hash = null;
      loginAccount.security_question_3_id = null;
      loginAccount.security_answer_3_hash = null;
      
      await loginAccount.save();
    }

    res.json({
      message: 'Password and username reset to default (member code). User must change password and set security questions on next login.',
      member_id: member.mem_id,
      member_code: member.member_code,
      default_username: member.member_code,
      default_password: member.member_code,
      login_account_id: loginAccount.id,
      password_reset_required: true,
      must_change_password: true
    });
  } catch (err) {
    console.error('Reset password by member ID error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username already exists. Please try again.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req,res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await LoginAccount.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    await found.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
