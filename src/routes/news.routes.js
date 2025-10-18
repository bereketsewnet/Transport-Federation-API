// src/routes/news.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/news.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { uploadNewsImage } = require('../middlewares/upload.middleware');

router.get('/', auth, ctrl.list); // can be public if preferred
router.post('/', auth, requireRole('admin'), uploadNewsImage, ctrl.create);
router.get('/:id', auth, ctrl.getById);
router.put('/:id', auth, requireRole('admin'), uploadNewsImage, ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
