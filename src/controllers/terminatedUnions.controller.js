// src/controllers/terminatedUnions.controller.js
const TerminatedUnion = require('../models/terminatedUnion.model');
const { Op } = require('sequelize');

exports.list = async (req,res) => {
  try {
    const { q, page=1, per_page=20, sort_by='archived_at', order='DESC' } = req.query;
    const where = {};
    if (q) where[Op.or] = [{ name_en: { [Op.like]: `%${q}%` } }, { name_am: { [Op.like]: `%${q}%` } }];
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await TerminatedUnion.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [[sort_by, order.toUpperCase()]] });
    res.json({ data: rows, meta: { total: count, page: parseInt(page), per_page: parseInt(per_page) }});
  } catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try {
    const item = await TerminatedUnion.findByPk(req.params.id);
    if(!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    // This is typically called when terminating a union
    const created = await TerminatedUnion.create(req.body);
    res.status(201).json(created);
  } catch(err){ console.error(err); res.status(400).json({ message: err.message }); }
};

exports.update = async (req,res) => {
  try {
    const found = await TerminatedUnion.findByPk(req.params.id);
    if(!found) return res.status(404).json({ message: 'Not found' });
    await found.update(req.body);
    res.json(found);
  } catch(err){ console.error(err); res.status(400).json({ message: err.message }); }
};

exports.remove = async (req,res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await TerminatedUnion.findByPk(req.params.id);
    if(!found) return res.status(404).json({ message: 'Not found' });
    await found.destroy();
    res.json({ message: 'Deleted' });
  } catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};
