// src/controllers/members.controller.js
const Member = require('../models/member.model');
const Archive = require('../models/archive.model');
const { Op } = require('sequelize');

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
    res.json(item);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    if (!req.body.first_name) return res.status(400).json({ message: 'first_name required' });
    // set mem_uuid if not set
    if (!req.body.mem_uuid) req.body.mem_uuid = require('uuid').v4();
    const created = await Member.create(req.body);
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.update = async (req,res) => {
  try {
    const found = await Member.findByPk(req.params.id);
    if (!found) return res.status(404).json({ message: 'Member not found' });
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
      await Archive.create({
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
        resigned_date: new Date(),
        reason: req.body.reason || 'Archived via API'
      });
      await found.destroy();
      return res.json({ message: 'Member archived' });
    }

    if (confirm === 'true') {
      await found.destroy();
      return res.json({ message: 'Member deleted' });
    }
    return res.status(400).json({ message: 'Deletion requires ?confirm=true or archive=true' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
