// src/controllers/sectors.controller.js
const Sector = require('../models/sector.model');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, page = 1, per_page = 100, sort_by = 'name', order = 'ASC' } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    const { rows, count } = await Sector.findAndCountAll({ 
      where, 
      limit: parseInt(per_page), 
      offset, 
      order: [[sort_by, order.toUpperCase()]] 
    });
    res.json({ data: rows, meta: { total: count, page: parseInt(page), per_page: parseInt(per_page) }});
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Sector.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Sector not found' });
    res.json(item);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ message: 'name is required' });
    const created = await Sector.create(req.body);
    res.status(201).json(created);
  } catch (err) { 
    console.error(err); 
    res.status(400).json({ message: err.message }); 
  }
};

exports.update = async (req, res) => {
  try {
    const found = await Sector.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Sector not found' });
    await found.update(req.body);
    res.json(found);
  } catch (err) { 
    console.error(err); 
    res.status(400).json({ message: err.message }); 
  }
};

exports.remove = async (req, res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const found = await Sector.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Sector not found' });
    await found.destroy();
    res.json({ message: 'Sector deleted' });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: err.message || 'Server error' }); 
  }
};

