// src/controllers/unionExecutives.controller.js
const UnionExecutive = require('../models/unionExecutive.model');
const Member = require('../models/member.model');
const { Op } = require('sequelize');

exports.list = async (req,res) => {
  try {
    const { q, union_id, position, page=1, per_page=20, sort_by='created_at', order='DESC' } = req.query;
    const where = {};
    if (union_id) where.union_id = union_id;
    if (position) where.position = position;
    if (q) where.position = { [Op.like]: `%${q}%` };
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await UnionExecutive.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [[sort_by, order.toUpperCase()]] });
    res.json({ data: rows, meta: { total: count, page: parseInt(page), per_page: parseInt(per_page) }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try {
    const item = await UnionExecutive.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    if (!req.body.union_id || !req.body.position) return res.status(400).json({ message: 'union_id and position required' });
    if (!req.body.member_code) return res.status(400).json({ message: 'member_code is required' });
    
    // Validate that member_code exists in members table
    const member = await Member.findOne({ where: { member_code: req.body.member_code } });
    if (!member) {
      return res.status(404).json({ message: `Member with code '${req.body.member_code}' not found. Please register the member first.` });
    }
    
    const created = await UnionExecutive.create(req.body);
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.update = async (req,res) => {
  try {
    const found = await UnionExecutive.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    
    // If member_code is being updated, validate it exists
    if (req.body.member_code) {
      const member = await Member.findOne({ where: { member_code: req.body.member_code } });
      if (!member) {
        return res.status(404).json({ message: `Member with code '${req.body.member_code}' not found. Please register the member first.` });
      }
    }
    
    await found.update(req.body);
    res.json(found);
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.remove = async (req,res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await UnionExecutive.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    await found.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
