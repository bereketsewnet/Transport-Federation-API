// src/routes/archives.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/archives.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/', auth, ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.get('/:id', auth, ctrl.getById);
router.post('/:id/restore', auth, requireRole('admin'), ctrl.restore);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
