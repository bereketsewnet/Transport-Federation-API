// src/controllers/visitors.controller.js
const Visitor = require('../models/visitor.model');

exports.list = async (req,res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from) where.visit_date = { [require('sequelize').Op.gte]: from };
    if (to) where.visit_date = Object.assign(where.visit_date || {}, { [require('sequelize').Op.lte]: to });
    const rows = await Visitor.findAll({ where, order: [['visit_date','DESC']] });
    res.json({ data: rows });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.createOrIncrement = async (req,res) => {
  try {
    // Accepts { visit_date: 'YYYY-MM-DD', increment: 1 }
    const { visit_date, increment = 1 } = req.body;
    if (!visit_date) return res.status(400).json({ message: 'visit_date required' });
    const [rec, created] = await Visitor.findOrCreate({ where: { visit_date }, defaults: { count: increment }});
    if (!created) {
      rec.count = rec.count + parseInt(increment);
      await rec.save();
    }
    res.json(rec);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try { const item = await Visitor.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); res.json(item); }
  catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
};

exports.remove = async (req,res) => {
  try { if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' }); const found = await Visitor.findByPk(req.params.id); if(!found) return res.status(404).json({message:'Not found'}); await found.destroy(); res.json({ message: 'Deleted' }); }
  catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};
