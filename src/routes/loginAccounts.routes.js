// src/routes/loginAccounts.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loginAccounts.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// admin-only management
router.get('/', auth, requireRole('admin'), ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.get('/:id', auth, requireRole('admin'), ctrl.getById);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.post('/reset/:username', auth, requireRole('admin'), ctrl.resetPassword); // POST new password
router.put('/:id/lock', auth, requireRole('admin'), ctrl.lockUnlock);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
