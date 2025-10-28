const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/oshIncidents.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Public routes - no authentication required for reading
router.get('/', ctrl.list);
router.get('/statistics', ctrl.getStatistics);
router.get('/:id', ctrl.getById);

// Admin routes - require authentication and admin role
router.post('/', auth, requireRole('admin'), ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
