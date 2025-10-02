// src/routes/contacts.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contacts.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/', auth, requireRole('admin'), ctrl.list); // admin-only to view messages
router.post('/', ctrl.create); // public contact form
router.get('/:id', auth, requireRole('admin'), ctrl.getById);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
