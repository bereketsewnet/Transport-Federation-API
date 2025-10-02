// src/routes/reports.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reports.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/members-summary', auth, requireRole('admin'), ctrl.membersSummary);
router.get('/unions-cba-expired', auth, requireRole('admin'), ctrl.unionsCbaExpired);

router.post('/cache', auth, requireRole('admin'), ctrl.createCache);
router.get('/cache', auth, requireRole('admin'), ctrl.listCache);
router.get('/cache/:id', auth, requireRole('admin'), ctrl.getCacheById);
router.delete('/cache/:id', auth, requireRole('admin'), ctrl.removeCache);

module.exports = router;
