// src/controllers/reports.controller.js
// reports.controller.js
const sequelize = require('../config/db');
const ReportCache = require('../models/reportCache.model');
const Member = require('../models/member.model');
const Union = require('../models/union.model');
const CBA = require('../models/cba.model');
const { QueryTypes } = require('sequelize');

/**
 * Useful endpoints:
 * - GET /api/reports/members-summary
 * - GET /api/reports/unions-cba-expired
 * - POST /api/reports/cache (save)
 * - GET /api/reports/cache (list)
 * - GET /api/reports/cache/:id
 */

exports.membersSummary = async (req,res) => {
  try {
    // counts by sex and totals
    const totals = await sequelize.query(
      `SELECT sex, COUNT(*) as cnt FROM members WHERE is_active = 1 GROUP BY sex;`,
      { type: QueryTypes.SELECT }
    );
    const totalMembersByYear = await sequelize.query(
      `SELECT YEAR(registry_date) AS year, COUNT(*) AS cnt FROM members GROUP BY YEAR(registry_date) ORDER BY year;`,
      { type: QueryTypes.SELECT }
    );
    res.json({ totals, per_year: totalMembersByYear });
  } catch (err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.unionsCbaExpired = async (req,res) => {
  try {
    const rows = await sequelize.query(
      `SELECT u.*, c.* FROM unions u JOIN cbas c ON u.union_id = c.union_id WHERE c.next_end_date < CURDATE();`,
      { type: QueryTypes.SELECT }
    );
    res.json({ data: rows });
  } catch (err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.createCache = async (req,res) => {
  try {
    const { report_name, payload } = req.body;
    if (!report_name || !payload) return res.status(400).json({ message: 'report_name and payload required' });
    const created = await ReportCache.create({ report_name, payload });
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(400).json({ message: err.message }); }
};

exports.listCache = async (req,res) => {
  try {
    const rows = await ReportCache.findAll({ order: [['generated_at','DESC']] });
    res.json({ data: rows });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getCacheById = async (req,res) => {
  try {
    const item = await ReportCache.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.removeCache = async (req,res) => {
  try {
    if (req.query.confirm !== 'true') return res.status(400).json({ message: 'To delete set ?confirm=true' });
    const item = await ReportCache.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
