// src/routes/sectors.routes.js
const express = require('express');
const router = express.Router();
const sectorsController = require('../controllers/sectors.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// List sectors (public or authenticated)
router.get('/', auth, sectorsController.list);

// Get sector by id
router.get('/:id', auth, sectorsController.getById);

// Create sector (admin only)
router.post('/', auth, requireRole('admin'), sectorsController.create);

// Update sector (admin only)
router.put('/:id', auth, requireRole('admin'), sectorsController.update);

// Delete sector (admin only)
router.delete('/:id', auth, requireRole('admin'), sectorsController.remove);

module.exports = router;

