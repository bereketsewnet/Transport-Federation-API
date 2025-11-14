// src/controllers/reports.controller.js
const sequelize = require('../config/db');
const { QueryTypes, Op } = require('sequelize');
const Member = require('../models/member.model');
const Union = require('../models/union.model');
const CBA = require('../models/cba.model');
const UnionExecutive = require('../models/unionExecutive.model');
const TerminatedUnion = require('../models/terminatedUnion.model');
const ReportCache = require('../models/reportCache.model');
const OSHIncident = require('../models/oshIncident.model');
const OrgLeader = require('../models/orgLeader.model');

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
        ue.member_code,
        CONCAT(m.first_name, ' ', m.father_name, ' ', m.surname) as executive_name,
        m.sex,
        ue.position,
        ue.appointed_date,
        ue.term_end_date,
        DATEDIFF(ue.term_end_date, CURDATE()) as days_remaining
      FROM union_executives ue
      LEFT JOIN unions u ON ue.union_id = u.union_id
      LEFT JOIN members m ON ue.member_code = m.member_code
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
        ue.member_code,
        CONCAT(m.first_name, ' ', m.father_name, ' ', m.surname) as executive_name,
        m.sex,
        ue.position,
        ue.appointed_date,
        ue.term_end_date,
        DATEDIFF(ue.term_end_date, CURDATE()) as days_remaining
      FROM union_executives ue
      LEFT JOIN unions u ON ue.union_id = u.union_id
      LEFT JOIN members m ON ue.member_code = m.member_code
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
      JOIN members m ON ue.member_code = m.member_code
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
// ORGANIZATION LEADERS / CEOs
// ==============================================

/**
 * Report 22: Organization Leaders summary by sector & organization
 * GET /api/reports/organization-leaders-summary
 */
exports.organizationLeadersSummary = async (req, res) => {
  try {
    const total = await OrgLeader.count();

    const bySector = await sequelize.query(
      `SELECT 
        COALESCE(sector, 'Unknown') AS sector,
        COUNT(*) AS count
      FROM organization_leaders
      GROUP BY sector
      ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    const byOrganization = await sequelize.query(
      `SELECT 
        COALESCE(organization, 'Unknown') AS organization,
        COUNT(*) AS count
      FROM organization_leaders
      GROUP BY organization
      ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      total_leaders: total,
      by_sector: bySector.map(item => ({
        sector: item.sector,
        count: parseInt(item.count, 10)
      })),
      by_organization: byOrganization.map(item => ({
        organization: item.organization,
        count: parseInt(item.count, 10)
      }))
    });
  } catch (err) {
    console.error('Organization leaders summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report 23: Filterable list of organization leaders / CEOs
 * GET /api/reports/organization-leaders-list
 */
exports.organizationLeadersList = async (req, res) => {
  try {
    const {
      q,
      union_id,
      sector,
      organization,
      page = 1,
      per_page = 20
    } = req.query;

    const limit = Math.max(1, parseInt(per_page, 10));
    const currentPage = Math.max(1, parseInt(page, 10));
    const offset = (currentPage - 1) * limit;

    let baseQuery = `
      FROM organization_leaders ol
      LEFT JOIN unions u ON ol.union_id = u.union_id
      WHERE 1=1
    `;

    const replacements = {};

    if (union_id) {
      baseQuery += ' AND ol.union_id = :union_id';
      replacements.union_id = union_id;
    }

    if (sector) {
      baseQuery += ' AND ol.sector = :sector';
      replacements.sector = sector;
    }

    if (organization) {
      baseQuery += ' AND ol.organization = :organization';
      replacements.organization = organization;
    }

    if (q) {
      baseQuery += `
        AND (
          ol.first_name LIKE :q OR
          ol.father_name LIKE :q OR
          ol.surname LIKE :q OR
          ol.position LIKE :q OR
          ol.title LIKE :q
        )
      `;
      replacements.q = `%${q}%`;
    }

    const countResult = await sequelize.query(
      `SELECT COUNT(*) AS count ${baseQuery}`,
      { replacements, type: QueryTypes.SELECT }
    );

    const data = await sequelize.query(
      `SELECT 
        ol.*,
        u.name_en AS union_name
      ${baseQuery}
      ORDER BY ol.created_at DESC, ol.id DESC
      LIMIT :limit OFFSET :offset`,
      {
        replacements: { ...replacements, limit, offset },
        type: QueryTypes.SELECT
      }
    );

    res.json({
      data,
      meta: {
        total: parseInt(countResult[0]?.count || 0, 10),
        page: currentPage,
        per_page: limit
      }
    });
  } catch (err) {
    console.error('Organization leaders list error:', err);
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

// ==============================================
// OSH (OCCUPATIONAL SAFETY AND HEALTH) REPORTS
// ==============================================

/**
 * OSH Report 1: OSH Incidents Summary by Category and Severity
 * GET /api/reports/osh-summary
 */
exports.oshSummary = async (req, res) => {
  try {
    const { union_id, from_date, to_date } = req.query;
    
    const where = {};
    if (union_id) where.unionId = union_id;
    
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }

    // Total incidents
    const total = await OSHIncident.count({ where });

    // By accident category
    const byCategory = await sequelize.query(
      `SELECT 
        accident_category, 
        COUNT(*) as count 
      FROM osh_incidents 
      ${union_id ? 'WHERE union_id = :unionId' : ''}
      ${from_date || to_date ? (union_id ? 'AND' : 'WHERE') + ' date_time_occurred BETWEEN :fromDate AND :toDate' : ''}
      GROUP BY accident_category 
      ORDER BY count DESC`,
      { 
        replacements: { 
          unionId: union_id,
          fromDate: from_date || '1900-01-01',
          toDate: to_date || '2100-12-31'
        },
        type: QueryTypes.SELECT 
      }
    );

    // By injury severity
    const byInjurySeverity = await sequelize.query(
      `SELECT 
        injury_severity, 
        COUNT(*) as count 
      FROM osh_incidents 
      ${union_id ? 'WHERE union_id = :unionId' : ''}
      ${from_date || to_date ? (union_id ? 'AND' : 'WHERE') + ' date_time_occurred BETWEEN :fromDate AND :toDate' : ''}
      GROUP BY injury_severity 
      ORDER BY count DESC`,
      { 
        replacements: { 
          unionId: union_id,
          fromDate: from_date || '1900-01-01',
          toDate: to_date || '2100-12-31'
        },
        type: QueryTypes.SELECT 
      }
    );

    // By damage severity
    const byDamageSeverity = await sequelize.query(
      `SELECT 
        damage_severity, 
        COUNT(*) as count 
      FROM osh_incidents 
      ${union_id ? 'WHERE union_id = :unionId' : ''}
      ${from_date || to_date ? (union_id ? 'AND' : 'WHERE') + ' date_time_occurred BETWEEN :fromDate AND :toDate' : ''}
      GROUP BY damage_severity 
      ORDER BY count DESC`,
      { 
        replacements: { 
          unionId: union_id,
          fromDate: from_date || '1900-01-01',
          toDate: to_date || '2100-12-31'
        },
        type: QueryTypes.SELECT 
      }
    );

    // By status
    const byStatus = await sequelize.query(
      `SELECT 
        status, 
        COUNT(*) as count 
      FROM osh_incidents 
      ${union_id ? 'WHERE union_id = :unionId' : ''}
      ${from_date || to_date ? (union_id ? 'AND' : 'WHERE') + ' date_time_occurred BETWEEN :fromDate AND :toDate' : ''}
      GROUP BY status 
      ORDER BY count DESC`,
      { 
        replacements: { 
          unionId: union_id,
          fromDate: from_date || '1900-01-01',
          toDate: to_date || '2100-12-31'
        },
        type: QueryTypes.SELECT 
      }
    );

    res.json({
      total_incidents: total,
      by_category: byCategory.map(item => ({
        category: item.accident_category,
        count: parseInt(item.count)
      })),
      by_injury_severity: byInjurySeverity.map(item => ({
        severity: item.injury_severity,
        count: parseInt(item.count)
      })),
      by_damage_severity: byDamageSeverity.map(item => ({
        severity: item.damage_severity,
        count: parseInt(item.count)
      })),
      by_status: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      }))
    });
  } catch (err) {
    console.error('OSH summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * OSH Report 2: High Severity Incidents (Major/Fatal injuries or Severe/Critical damage)
 * GET /api/reports/osh-high-severity
 */
exports.oshHighSeverity = async (req, res) => {
  try {
    const { union_id, from_date, to_date } = req.query;
    
    const where = {
      [Op.or]: [
        { injurySeverity: { [Op.in]: ['Major', 'Fatal', 'Permanent Disability/Major Injury', 'Fatality'] } },
        { damageSeverity: { [Op.in]: ['Major', 'Severe/Critical'] } }
      ]
    };
    
    if (union_id) where.unionId = union_id;
    
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }

    const incidents = await OSHIncident.findAll({
      where,
      include: [{
        model: Union,
        as: 'union',
        attributes: ['id', 'name_en', 'name_am', 'union_code']
      }],
      order: [['dateTimeOccurred', 'DESC']]
    });

    res.json({
      count: incidents.length,
      data: incidents.map(incident => {
        const incidentData = incident.toJSON();
        incidentData.rootCauses = [];
        if (incidentData.rootCauseUnsafeAct) incidentData.rootCauses.push('Unsafe Act');
        if (incidentData.rootCauseEquipmentFailure) incidentData.rootCauses.push('Equipment Failure');
        if (incidentData.rootCauseEnvironmental) incidentData.rootCauses.push('Environmental');
        if (incidentData.rootCauseOther) incidentData.rootCauses.push(incidentData.rootCauseOther);
        return incidentData;
      })
    });
  } catch (err) {
    console.error('OSH high severity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * OSH Report 3: Incidents Requiring Regulatory Reports
 * GET /api/reports/osh-regulatory-reports
 */
exports.oshRegulatoryReports = async (req, res) => {
  try {
    const { union_id, from_date, to_date } = req.query;
    
    const where = { regulatoryReportRequired: true };
    
    if (union_id) where.unionId = union_id;
    
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }

    const incidents = await OSHIncident.findAll({
      where,
      include: [{
        model: Union,
        as: 'union',
        attributes: ['id', 'name_en', 'name_am', 'union_code']
      }],
      order: [['regulatoryReportDate', 'DESC']]
    });

    res.json({
      count: incidents.length,
      data: incidents.map(incident => {
        const incidentData = incident.toJSON();
        incidentData.rootCauses = [];
        if (incidentData.rootCauseUnsafeAct) incidentData.rootCauses.push('Unsafe Act');
        if (incidentData.rootCauseEquipmentFailure) incidentData.rootCauses.push('Equipment Failure');
        if (incidentData.rootCauseEnvironmental) incidentData.rootCauses.push('Environmental');
        if (incidentData.rootCauseOther) incidentData.rootCauses.push(incidentData.rootCauseOther);
        return incidentData;
      })
    });
  } catch (err) {
    console.error('OSH regulatory reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * OSH Report 4: Monthly Incident Trends
 * GET /api/reports/osh-monthly-trends
 */
exports.oshMonthlyTrends = async (req, res) => {
  try {
    const { union_id, months = 12 } = req.query;
    
    const where = {};
    if (union_id) where.unionId = union_id;
    
    // Last N months
    where.dateTimeOccurred = {
      [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - parseInt(months)))
    };

    const trends = await sequelize.query(
      `SELECT 
        DATE_FORMAT(date_time_occurred, '%Y-%m') as month,
        accident_category,
        COUNT(*) as count
      FROM osh_incidents 
      WHERE date_time_occurred >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
      ${union_id ? 'AND union_id = :unionId' : ''}
      GROUP BY DATE_FORMAT(date_time_occurred, '%Y-%m'), accident_category
      ORDER BY month ASC, accident_category ASC`,
      { 
        replacements: { 
          months: parseInt(months),
          unionId: union_id
        },
        type: QueryTypes.SELECT 
      }
    );

    // Format for easier graphing
    const monthlyData = {};
    trends.forEach(item => {
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = { month: item.month, People: 0, 'Property/Asset': 0, total: 0 };
      }
      monthlyData[item.month][item.accident_category] = parseInt(item.count);
      monthlyData[item.month].total += parseInt(item.count);
    });

    res.json({
      period_months: parseInt(months),
      data: Object.values(monthlyData)
    });
  } catch (err) {
    console.error('OSH monthly trends error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * OSH Report 5: Root Cause Analysis Summary
 * GET /api/reports/osh-root-causes
 */
exports.oshRootCauses = async (req, res) => {
  try {
    const { union_id, from_date, to_date } = req.query;
    
    const where = {};
    if (union_id) where.unionId = union_id;
    
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }

    const rootCauses = await sequelize.query(
      `SELECT 
        SUM(CASE WHEN root_cause_unsafe_act = 1 THEN 1 ELSE 0 END) as unsafe_act,
        SUM(CASE WHEN root_cause_equipment_failure = 1 THEN 1 ELSE 0 END) as equipment_failure,
        SUM(CASE WHEN root_cause_environmental = 1 THEN 1 ELSE 0 END) as environmental,
        COUNT(*) as total_incidents
      FROM osh_incidents 
      ${union_id ? 'WHERE union_id = :unionId' : ''}
      ${from_date || to_date ? (union_id ? 'AND' : 'WHERE') + ' date_time_occurred BETWEEN :fromDate AND :toDate' : ''}`,
      { 
        replacements: { 
          unionId: union_id,
          fromDate: from_date || '1900-01-01',
          toDate: to_date || '2100-12-31'
        },
        type: QueryTypes.SELECT 
      }
    );

    const result = rootCauses[0];
    const total = parseInt(result.total_incidents);

    res.json({
      total_incidents: total,
      root_causes: {
        unsafe_act: parseInt(result.unsafe_act),
        equipment_failure: parseInt(result.equipment_failure),
        environmental: parseInt(result.environmental),
        other: total - parseInt(result.unsafe_act) - parseInt(result.equipment_failure) - parseInt(result.environmental)
      },
      percentages: total > 0 ? {
        unsafe_act: ((parseInt(result.unsafe_act) / total) * 100).toFixed(2),
        equipment_failure: ((parseInt(result.equipment_failure) / total) * 100).toFixed(2),
        environmental: ((parseInt(result.environmental) / total) * 100).toFixed(2),
        other: (((total - parseInt(result.unsafe_act) - parseInt(result.equipment_failure) - parseInt(result.environmental)) / total) * 100).toFixed(2)
      } : {}
    });
  } catch (err) {
    console.error('OSH root causes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
