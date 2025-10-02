// src/controllers/photos.controller.js
const Photo = require('../models/photo.model');
const { Op } = require('sequelize');

exports.list = async (req,res) => {
  try {
    const { gallery_id, q, page=1, per_page=20 } = req.query;
    const where = {};
    if (gallery_id) where.gallery_id = gallery_id;
    if (q) where.caption = { [Op.like]: `%${q}%` };
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await Photo.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [['created_at','DESC']] });
    res.json({ data: rows, meta: { total: count }});
  } catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};

exports.getById = async (req,res) => {
  try { const item = await Photo.findByPk(req.params.id); if(!item) return res.status(404).json({ message:'Not found' }); res.json(item); }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    // Expect body to contain gallery_id and filename (upload managed separately)
    if (!req.body.filename) return res.status(400).json({ message: 'filename required' });
    const created = await Photo.create(req.body);
    res.status(201).json(created);
  } catch(err){ console.error(err); res.status(400).json({ message: err.message }); }
};

exports.update = async (req,res) => {
  try { const found = await Photo.findByPk(req.params.id); if(!found) return res.status(404).json({ message:'Not found' }); await found.update(req.body); res.json(found); }
  catch(err){ console.error(err); res.status(400).json({ message: err.message }); }
};

exports.remove = async (req,res) => {
  try { if (req.query.confirm !== 'true') return res.status(400).json({ message:'To delete set ?confirm=true' }); const found = await Photo.findByPk(req.params.id); if(!found) return res.status(404).json({ message:'Not found' }); await found.destroy(); res.json({ message:'Deleted' }); }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};
