// src/controllers/reports.controller.js
const sequelize = require('../config/db');
const { QueryTypes, Op } = require('sequelize');
const Member = require('../models/member.model');
const Union = require('../models/union.model');
const CBA = require('../models/cba.model');
const UnionExecutive = require('../models/unionExecutive.model');
const TerminatedUnion = require('../models/terminatedUnion.model');
const ReportCache = require('../models/reportCache.model');

/**
 * COMPREHENSIVE REPORTS CONTROLLER
 * Contains 21 report endpoints as requested by the company
 */

// ==============================================
// REPORTS 1-2: MEMBER STATISTICS
// ==============================================

/**
 * Report 1 & 2: Number of members (Male, Female, Total) 
 * and by year of registration
 * GET /api/reports/members-summary
 */
exports.membersSummary = async (req, res) => {
  try {
    // Total counts by sex
    const totalsBySex = await sequelize.query(
      `SELECT 
        sex, 
        COUNT(*) as count 
      FROM members 
      WHERE is_active = 1 
      GROUP BY sex`,
      { type: QueryTypes.SELECT }
    );

    // Calculate grand total
    const grandTotal = totalsBySex.reduce((sum, item) => sum + parseInt(item.count), 0);

    // Counts by year and sex
    const byYear = await sequelize.query(
      `SELECT 
        YEAR(registry_date) AS year,
        sex,
        COUNT(*) AS count 
      FROM members 
      WHERE is_active = 1 AND registry_date IS NOT NULL
      GROUP BY YEAR(registry_date), sex 
      ORDER BY year ASC`,
      { type: QueryTypes.SELECT }
    );

    // Format by year for easier graphing
    const yearSummary = {};
    byYear.forEach(item => {
      if (!yearSummary[item.year]) {
        yearSummary[item.year] = { year: item.year, Male: 0, Female: 0, total: 0 };
      }
      yearSummary[item.year][item.sex] = parseInt(item.count);
      yearSummary[item.year].total += parseInt(item.count);
    });

    res.json({
      summary: {
        by_sex: totalsBySex.map(item => ({
          sex: item.sex,
          count: parseInt(item.count)
        })),
        grand_total: grandTotal
      },
      by_year: Object.values(yearSummary)
    });
  } catch (err) {
    console.error('Members summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 3-4: UNION STATISTICS
// ==============================================

/**
 * Report 3 & 4: Total unions and by sector/organization
 * GET /api/reports/unions-summary
 */
exports.unionsSummary = async (req, res) => {
  try {
    // Total count
    const total = await Union.count();

    // By sector
    const bySector = await sequelize.query(
      `SELECT 
        sector, 
        COUNT(*) as count 
      FROM unions 
      GROUP BY sector 
      ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    // By organization
    const byOrganization = await sequelize.query(
      `SELECT 
        organization, 
        COUNT(*) as count 
      FROM unions 
      GROUP BY organization 
      ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      total_unions: total,
      by_sector: bySector.map(item => ({
        sector: item.sector || 'Unknown',
        count: parseInt(item.count)
      })),
      by_organization: byOrganization.map(item => ({
        organization: item.organization || 'Unknown',
        count: parseInt(item.count)
      }))
    });
  } catch (err) {
    console.error('Unions summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 5-7: UNION EXECUTIVES
// ==============================================

/**
 * Report 5: List Union Executives with remaining days on position
 * GET /api/reports/executives-remaining-days
 */
exports.executivesRemainingDays = async (req, res) => {
  try {
    const executives = await sequelize.query(
      `SELECT 
        ue.id,
        ue.union_id,
        u.name_en as union_name,
        ue.mem_id,
        CONCAT(m.first_name, ' ', m.father_name, ' ', m.surname) as executive_name,
        m.sex,
        ue.position,
        ue.appointed_date,
        ue.term_end_date,
        DATEDIFF(ue.term_end_date, CURDATE()) as days_remaining
      FROM union_executives ue
      LEFT JOIN unions u ON ue.union_id = u.union_id
      LEFT JOIN members m ON ue.mem_id = m.mem_id
      WHERE ue.is_current = 1 AND ue.term_end_date IS NOT NULL
      ORDER BY days_remaining ASC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      data: executives.map(item => ({
        ...item,
        days_remaining: parseInt(item.days_remaining),
        status: item.days_remaining < 0 ? 'Expired' : 
                item.days_remaining === 0 ? 'Expires Today' :
                item.days_remaining <= 30 ? 'Expiring Soon' : 'Active'
      }))
    });
  } catch (err) {
    console.error('Executives remaining days error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 6: List executives with remaining date less than specific date
 * GET /api/reports/executives-expiring-before?date=2025-12-31
 */
exports.executivesExpiringBefore = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'date parameter required (YYYY-MM-DD)' });
    }

    const executives = await sequelize.query(
      `SELECT 
        ue.id,
        ue.union_id,
        u.name_en as union_name,
        ue.mem_id,
        CONCAT(m.first_name, ' ', m.father_name, ' ', m.surname) as executive_name,
        m.sex,
        ue.position,
        ue.appointed_date,
        ue.term_end_date,
        DATEDIFF(ue.term_end_date, CURDATE()) as days_remaining
      FROM union_executives ue
      LEFT JOIN unions u ON ue.union_id = u.union_id
      LEFT JOIN members m ON ue.mem_id = m.mem_id
      WHERE ue.is_current = 1 
        AND ue.term_end_date IS NOT NULL
        AND ue.term_end_date < :targetDate
      ORDER BY ue.term_end_date ASC`,
      { 
        replacements: { targetDate: date },
        type: QueryTypes.SELECT 
      }
    );

    res.json({
      target_date: date,
      count: executives.length,
      data: executives.map(item => ({
        ...item,
        days_remaining: parseInt(item.days_remaining)
      }))
    });
  } catch (err) {
    console.error('Executives expiring before error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 7: Number of executive committee (Male, Female) for specific union
 * GET /api/reports/executives-by-union?union_id=1
 */
exports.executivesByUnion = async (req, res) => {
  try {
    const { union_id } = req.query;
    if (!union_id) {
      return res.status(400).json({ message: 'union_id parameter required' });
    }

    // Get union info
    const union = await Union.findByPk(union_id);
    if (!union) {
      return res.status(404).json({ message: 'Union not found' });
    }

    // Count by sex
    const bySex = await sequelize.query(
      `SELECT 
        m.sex, 
        COUNT(*) as count 
      FROM union_executives ue
      JOIN members m ON ue.mem_id = m.mem_id
      WHERE ue.union_id = :unionId AND ue.is_current = 1
      GROUP BY m.sex`,
      { 
        replacements: { unionId: union_id },
        type: QueryTypes.SELECT 
      }
    );

    const total = bySex.reduce((sum, item) => sum + parseInt(item.count), 0);

    res.json({
      union_id: parseInt(union_id),
      union_name: union.name_en,
      executives_count: {
        by_sex: bySex.map(item => ({
          sex: item.sex,
          count: parseInt(item.count)
        })),
        total: total
      }
    });
  } catch (err) {
    console.error('Executives by union error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 8-9: AGE-BASED MEMBER STATISTICS
// ==============================================

/**
 * Report 8: Number of youths under 35 years old (Male, Female, Total)
 * GET /api/reports/members-under-35
 */
exports.membersUnder35 = async (req, res) => {
  try {
    const results = await sequelize.query(
      `SELECT 
        sex, 
        COUNT(*) as count 
      FROM members 
      WHERE is_active = 1 
        AND birthdate IS NOT NULL
        AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 35
      GROUP BY sex`,
      { type: QueryTypes.SELECT }
    );

    const total = results.reduce((sum, item) => sum + parseInt(item.count), 0);

    res.json({
      category: 'Under 35 years old',
      by_sex: results.map(item => ({
        sex: item.sex,
        count: parseInt(item.count)
      })),
      total: total
    });
  } catch (err) {
    console.error('Members under 35 error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 9: Number of members above 35 years old (Male, Female, Total)
 * GET /api/reports/members-above-35
 */
exports.membersAbove35 = async (req, res) => {
  try {
    const results = await sequelize.query(
      `SELECT 
        sex, 
        COUNT(*) as count 
      FROM members 
      WHERE is_active = 1 
        AND birthdate IS NOT NULL
        AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= 35
      GROUP BY sex`,
      { type: QueryTypes.SELECT }
    );

    const total = results.reduce((sum, item) => sum + parseInt(item.count), 0);

    res.json({
      category: '35 years old and above',
      by_sex: results.map(item => ({
        sex: item.sex,
        count: parseInt(item.count)
      })),
      total: total
    });
  } catch (err) {
    console.error('Members above 35 error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 10-15: CBA (COLLECTIVE BARGAINING AGREEMENT) REPORTS
// ==============================================

/**
 * Report 10 & 11: Number of unions with/without CBA
 * GET /api/reports/unions-cba-status
 */
exports.unionsCbaStatus = async (req, res) => {
  try {
    const totalUnions = await Union.count();
    
    // Unions with CBA
    const unionsWithCBA = await sequelize.query(
      `SELECT COUNT(DISTINCT union_id) as count 
       FROM cbas`,
      { type: QueryTypes.SELECT }
    );

    const withCBA = parseInt(unionsWithCBA[0].count);
    const withoutCBA = totalUnions - withCBA;

    res.json({
      total_unions: totalUnions,
      with_cba: withCBA,
      without_cba: withoutCBA,
      percentage_with_cba: totalUnions > 0 ? ((withCBA / totalUnions) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Unions CBA status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 12: List unions without CBA
 * GET /api/reports/unions-without-cba
 */
exports.unionsWithoutCBA = async (req, res) => {
  try {
    const unions = await sequelize.query(
      `SELECT 
        u.union_id,
        u.union_code,
        u.name_en,
        u.name_am,
        u.sector,
        u.organization,
        u.established_date
      FROM unions u
      WHERE u.union_id NOT IN (SELECT DISTINCT union_id FROM cbas)
      ORDER BY u.name_en ASC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      count: unions.length,
      data: unions
    });
  } catch (err) {
    console.error('Unions without CBA error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 13: List unions with expired CBA
 * GET /api/reports/unions-cba-expired
 */
exports.unionsCbaExpired = async (req, res) => {
  try {
    const unions = await sequelize.query(
      `SELECT 
        u.union_id,
        u.union_code,
        u.name_en,
        u.name_am,
        u.sector,
        u.organization,
        c.id as cba_id,
        c.status,
        c.registration_date,
        c.next_end_date,
        c.duration_years,
        DATEDIFF(CURDATE(), c.next_end_date) as days_expired
      FROM unions u
      JOIN cbas c ON u.union_id = c.union_id
      WHERE c.next_end_date < CURDATE()
      ORDER BY c.next_end_date ASC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      count: unions.length,
      data: unions.map(item => ({
        ...item,
        days_expired: parseInt(item.days_expired)
      }))
    });
  } catch (err) {
    console.error('Unions CBA expired error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 14: List unions with CBA reaching expiration
 * GET /api/reports/unions-cba-expiring-soon?days=90
 * Default: 90 days (3 months)
 */
exports.unionsCbaExpiringSoon = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90; // Default 3 months

    const unions = await sequelize.query(
      `SELECT 
        u.union_id,
        u.union_code,
        u.name_en,
        u.name_am,
        u.sector,
        u.organization,
        c.id as cba_id,
        c.status,
        c.registration_date,
        c.next_end_date,
        c.duration_years,
        DATEDIFF(c.next_end_date, CURDATE()) as days_remaining
      FROM unions u
      JOIN cbas c ON u.union_id = c.union_id
      WHERE c.next_end_date > CURDATE() 
        AND c.next_end_date <= DATE_ADD(CURDATE(), INTERVAL :days DAY)
      ORDER BY c.next_end_date ASC`,
      { 
        replacements: { days: days },
        type: QueryTypes.SELECT 
      }
    );

    res.json({
      threshold_days: days,
      count: unions.length,
      data: unions.map(item => ({
        ...item,
        days_remaining: parseInt(item.days_remaining)
      }))
    });
  } catch (err) {
    console.error('Unions CBA expiring soon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 15: List unions with ongoing CBA
 * GET /api/reports/unions-cba-ongoing
 */
exports.unionsCbaOngoing = async (req, res) => {
  try {
    const unions = await sequelize.query(
      `SELECT 
        u.union_id,
        u.union_code,
        u.name_en,
        u.name_am,
        u.sector,
        u.organization,
        c.id as cba_id,
        c.status,
        c.registration_date,
        c.next_end_date,
        c.duration_years,
        DATEDIFF(c.next_end_date, CURDATE()) as days_remaining
      FROM unions u
      JOIN cbas c ON u.union_id = c.union_id
      WHERE c.next_end_date > CURDATE()
      ORDER BY c.next_end_date ASC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      count: unions.length,
      data: unions.map(item => ({
        ...item,
        days_remaining: parseInt(item.days_remaining)
      }))
    });
  } catch (err) {
    console.error('Unions CBA ongoing error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 16-18: GENERAL ASSEMBLY REPORTS
// ==============================================

/**
 * Report 16: Number of unions conducting general assembly vs not
 * GET /api/reports/unions-general-assembly-status
 */
exports.unionsGeneralAssemblyStatus = async (req, res) => {
  try {
    const totalUnions = await Union.count();
    
    const withAssembly = await Union.count({
      where: {
        general_assembly_date: { [Op.ne]: null }
      }
    });

    const withoutAssembly = totalUnions - withAssembly;

    res.json({
      total_unions: totalUnions,
      conducted_general_assembly: withAssembly,
      not_conducted: withoutAssembly,
      percentage_conducted: totalUnions > 0 ? ((withAssembly / totalUnions) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Unions general assembly status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 17: List unions not conducting general assembly yet
 * GET /api/reports/unions-no-general-assembly
 */
exports.unionsNoGeneralAssembly = async (req, res) => {
  try {
    const unions = await Union.findAll({
      where: {
        general_assembly_date: null
      },
      order: [['name_en', 'ASC']]
    });

    res.json({
      count: unions.length,
      data: unions
    });
  } catch (err) {
    console.error('Unions no general assembly error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 18: List unions with last congress/assembly on specific date
 * GET /api/reports/unions-assembly-on-date?date=2024-01-01
 */
exports.unionsAssemblyOnDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'date parameter required (YYYY-MM-DD)' });
    }

    const unions = await Union.findAll({
      where: {
        general_assembly_date: date
      },
      order: [['name_en', 'ASC']]
    });

    res.json({
      search_date: date,
      count: unions.length,
      data: unions
    });
  } catch (err) {
    console.error('Unions assembly on date error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 21: Unions with general assembly less than 3 months ago
 * GET /api/reports/unions-assembly-recent?months=3
 */
exports.unionsAssemblyRecent = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;

    const unions = await sequelize.query(
      `SELECT 
        union_id,
        union_code,
        name_en,
        name_am,
        sector,
        organization,
        general_assembly_date,
        DATEDIFF(CURDATE(), general_assembly_date) as days_since_assembly,
        TIMESTAMPDIFF(MONTH, general_assembly_date, CURDATE()) as months_since_assembly
      FROM unions
      WHERE general_assembly_date IS NOT NULL
        AND general_assembly_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
      ORDER BY general_assembly_date DESC`,
      { 
        replacements: { months: months },
        type: QueryTypes.SELECT 
      }
    );

    res.json({
      threshold_months: months,
      count: unions.length,
      data: unions.map(item => ({
        ...item,
        days_since_assembly: parseInt(item.days_since_assembly),
        months_since_assembly: parseInt(item.months_since_assembly)
      }))
    });
  } catch (err) {
    console.error('Unions assembly recent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORTS 19-20: TERMINATED UNIONS
// ==============================================

/**
 * Report 19: Number of Terminated Unions
 * GET /api/reports/terminated-unions-count
 */
exports.terminatedUnionsCount = async (req, res) => {
  try {
    const total = await TerminatedUnion.count();
    
    // By sector
    const bySector = await sequelize.query(
      `SELECT 
        sector, 
        COUNT(*) as count 
      FROM terminated_unions 
      GROUP BY sector 
      ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      total_terminated: total,
      by_sector: bySector.map(item => ({
        sector: item.sector || 'Unknown',
        count: parseInt(item.count)
      }))
    });
  } catch (err) {
    console.error('Terminated unions count error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 20: List Terminated Unions
 * GET /api/reports/terminated-unions-list
 */
exports.terminatedUnionsList = async (req, res) => {
  try {
    const unions = await TerminatedUnion.findAll({
      order: [['terminated_date', 'DESC']]
    });

    res.json({
      count: unions.length,
      data: unions
    });
  } catch (err) {
    console.error('Terminated unions list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================================
// REPORT CACHE MANAGEMENT (BONUS)
// ==============================================

/**
 * Save/cache a report
 * POST /api/reports/cache
 */
exports.createCache = async (req, res) => {
  try {
    const { report_name, payload } = req.body;
    if (!report_name || !payload) {
      return res.status(400).json({ message: 'report_name and payload required' });
    }
    const created = await ReportCache.create({ report_name, payload });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create cache error:', err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * List cached reports
 * GET /api/reports/cache
 */
exports.listCache = async (req, res) => {
  try {
    const rows = await ReportCache.findAll({ 
      order: [['generated_at', 'DESC']] 
    });
    res.json({ data: rows });
  } catch (err) {
    console.error('List cache error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get cached report by ID
 * GET /api/reports/cache/:id
 */
exports.getCacheById = async (req, res) => {
  try {
    const item = await ReportCache.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Get cache error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete cached report
 * DELETE /api/reports/cache/:id?confirm=true
 */
exports.removeCache = async (req, res) => {
  try {
    if (req.query.confirm !== 'true') {
      return res.status(400).json({ message: 'To delete set ?confirm=true' });
    }
    const item = await ReportCache.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Remove cache error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
