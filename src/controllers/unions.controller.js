// src/controllers/unions.controller.js
const Union = require('../models/union.model');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, sector, page = 1, per_page = 20, sort_by = 'created_at', order = 'DESC' } = req.query;
    const where = {};
    if (q) where[Op.or] = [{ name_en: { [Op.like]: `%${q}%` } }, { name_am: { [Op.like]: `%${q}%` } }, { organization: { [Op.like]: `%${q}%` } }];
    if (sector) where.sector = sector;
    
    // Exclude terminated unions
    const [terminatedUnionIds] = await sequelize.query(
      'SELECT DISTINCT union_id FROM terminated_unions WHERE union_id IS NOT NULL'
    );
    const terminatedIds = terminatedUnionIds.map(t => t.union_id).filter(id => id !== null);
    if (terminatedIds.length > 0) {
      where.union_id = { [Op.notIn]: terminatedIds };
    }
    
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    const { rows, count } = await Union.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [[sort_by, order.toUpperCase()]] });
    return res.json({ data: rows, meta: { total: count, page: parseInt(page), per_page: parseInt(per_page) }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Union.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    return res.json(item);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.name_en) return res.status(400).json({ message: 'name_en is required' });
    const created = await Union.create(payload);
    return res.status(201).json(created);
  } catch (err) { console.error(err); return res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const found = await Union.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    await found.update(req.body);
    return res.json(found);
  } catch (err) { console.error(err); return res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const confirm = req.query.confirm === 'true';
    if (!confirm) return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await Union.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    await found.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error' }); }
};
