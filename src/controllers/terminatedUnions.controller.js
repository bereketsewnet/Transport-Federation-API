// src/controllers/terminatedUnions.controller.js
const TerminatedUnion = require('../models/terminatedUnion.model');
const Union = require('../models/union.model');
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

exports.restore = async (req, res) => {
  try {
    const { id } = req.params;
    const terminatedUnion = await TerminatedUnion.findByPk(id);
    if (!terminatedUnion) {
      return res.status(404).json({ message: 'Terminated union not found' });
    }

    // Check if union already exists (by union_id or union_code)
    let existingUnion = null;
    if (terminatedUnion.union_id) {
      existingUnion = await Union.findByPk(terminatedUnion.union_id);
    }

    if (existingUnion) {
      // If union still exists, just remove from terminated list
      await terminatedUnion.destroy();
      return res.json({ 
        message: 'Union restored successfully (was still in unions table)', 
        restored_union: existingUnion 
      });
    }

    // Create new union from terminated union data
    const unionData = {
      union_code: terminatedUnion.union_id ? `RESTORED_${terminatedUnion.union_id}` : null,
      name_en: terminatedUnion.name_en,
      name_am: terminatedUnion.name_am,
      sector: terminatedUnion.sector,
      organization: terminatedUnion.organization,
      established_date: terminatedUnion.established_date,
      terms_of_election: terminatedUnion.terms_of_election,
      general_assembly_date: terminatedUnion.general_assembly_date,
      strategic_plan_in_place: terminatedUnion.strategic_plan_in_place,
      external_audit_date: terminatedUnion.external_audit_date,
      region: terminatedUnion.region,
      zone: terminatedUnion.zone,
      city: terminatedUnion.city,
      sub_city: terminatedUnion.sub_city,
      woreda: terminatedUnion.woreda,
      location_area: terminatedUnion.location_area
    };

    const restoredUnion = await Union.create(unionData);

    // Delete the terminated union record
    await terminatedUnion.destroy();

    return res.json({ 
      message: 'Union restored successfully', 
      restored_union: restoredUnion 
    });
  } catch (err) {
    console.error('Restore union error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
