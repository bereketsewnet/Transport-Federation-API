// src/routes/unions.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/unions.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// all endpoints protected for government project; adjust roles as needed
router.get('/', auth, ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.get('/:id', auth, ctrl.getById);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
