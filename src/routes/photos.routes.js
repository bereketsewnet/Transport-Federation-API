// src/routes/photos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/photos.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { optionalPhotoUpload } = require('../middlewares/upload.middleware');

// Public routes - no authentication required
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

// Admin routes - require authentication and admin role
router.post('/', auth, requireRole('admin'), optionalPhotoUpload, ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
