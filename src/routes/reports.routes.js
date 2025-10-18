// src/routes/reports.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reports.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// ==============================================
// MEMBER STATISTICS (Reports 1-2)
// ==============================================
router.get('/members-summary', auth, requireRole('admin'), ctrl.membersSummary);

// ==============================================
// UNION STATISTICS (Reports 3-4)
// ==============================================
router.get('/unions-summary', auth, requireRole('admin'), ctrl.unionsSummary);

// ==============================================
// UNION EXECUTIVES (Reports 5-7)
// ==============================================
router.get('/executives-remaining-days', auth, requireRole('admin'), ctrl.executivesRemainingDays);
router.get('/executives-expiring-before', auth, requireRole('admin'), ctrl.executivesExpiringBefore);
router.get('/executives-by-union', auth, requireRole('admin'), ctrl.executivesByUnion);

// ==============================================
// AGE-BASED MEMBER STATISTICS (Reports 8-9)
// ==============================================
router.get('/members-under-35', auth, requireRole('admin'), ctrl.membersUnder35);
router.get('/members-above-35', auth, requireRole('admin'), ctrl.membersAbove35);

// ==============================================
// CBA REPORTS (Reports 10-15)
// ==============================================
router.get('/unions-cba-status', auth, requireRole('admin'), ctrl.unionsCbaStatus);
router.get('/unions-without-cba', auth, requireRole('admin'), ctrl.unionsWithoutCBA);
router.get('/unions-cba-expired', auth, requireRole('admin'), ctrl.unionsCbaExpired);
router.get('/unions-cba-expiring-soon', auth, requireRole('admin'), ctrl.unionsCbaExpiringSoon);
router.get('/unions-cba-ongoing', auth, requireRole('admin'), ctrl.unionsCbaOngoing);

// ==============================================
// GENERAL ASSEMBLY REPORTS (Reports 16-18, 21)
// ==============================================
router.get('/unions-general-assembly-status', auth, requireRole('admin'), ctrl.unionsGeneralAssemblyStatus);
router.get('/unions-no-general-assembly', auth, requireRole('admin'), ctrl.unionsNoGeneralAssembly);
router.get('/unions-assembly-on-date', auth, requireRole('admin'), ctrl.unionsAssemblyOnDate);
router.get('/unions-assembly-recent', auth, requireRole('admin'), ctrl.unionsAssemblyRecent);

// ==============================================
// TERMINATED UNIONS (Reports 19-20)
// ==============================================
router.get('/terminated-unions-count', auth, requireRole('admin'), ctrl.terminatedUnionsCount);
router.get('/terminated-unions-list', auth, requireRole('admin'), ctrl.terminatedUnionsList);

// ==============================================
// REPORT CACHE MANAGEMENT
// ==============================================
router.post('/cache', auth, requireRole('admin'), ctrl.createCache);
router.get('/cache', auth, requireRole('admin'), ctrl.listCache);
router.get('/cache/:id', auth, requireRole('admin'), ctrl.getCacheById);
router.delete('/cache/:id', auth, requireRole('admin'), ctrl.removeCache);

module.exports = router;
