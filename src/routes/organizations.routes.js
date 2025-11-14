// src/routes/organizations.routes.js
const express = require('express');
const router = express.Router();
const organizationsController = require('../controllers/organizations.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// List organizations (public or authenticated)
router.get('/', auth, organizationsController.list);

// Get organization by id
router.get('/:id', auth, organizationsController.getById);

// Create organization (admin only)
router.post('/', auth, requireRole('admin'), organizationsController.create);

// Update organization (admin only)
router.put('/:id', auth, requireRole('admin'), organizationsController.update);

// Delete organization (admin only)
router.delete('/:id', auth, requireRole('admin'), organizationsController.remove);

module.exports = router;

