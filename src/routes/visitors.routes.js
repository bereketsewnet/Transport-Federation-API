// src/routes/visitors.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/visitors.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/', auth, ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.createOrIncrement);
router.get('/:id', auth, ctrl.getById);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
