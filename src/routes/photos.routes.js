// src/routes/photos.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/photos.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// file upload handled separately (e.g., multer) - here we only store metadata
router.get('/', auth, ctrl.list);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.get('/:id', auth, ctrl.getById);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
