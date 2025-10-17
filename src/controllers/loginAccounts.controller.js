// src/controllers/loginAccounts.controller.js
const LoginAccount = require('../models/loginAccount.model');
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

exports.remove = async (req,res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await LoginAccount.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    await found.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
