// src/routes/cms.routes.js
const express = require('express');
const router = express.Router();
const cmsCtrl = require('../controllers/cms.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { uploadCmsHeroImage, uploadCmsExecutiveImage } = require('../middlewares/upload.middleware');

// ==================== HOME CONTENT ROUTES ====================

// Public routes - no authentication required
router.get('/home-content', cmsCtrl.getHomeContent);

// Admin routes - require authentication and admin role
router.put('/home-content', auth, requireRole('admin'), cmsCtrl.updateHomeContent);
router.post('/home-content/hero-image', auth, requireRole('admin'), uploadCmsHeroImage, cmsCtrl.uploadHeroImage);

// ==================== ABOUT CONTENT ROUTES ====================

// Public routes - no authentication required
router.get('/about-content', cmsCtrl.getAboutContent);

// Admin routes - require authentication and admin role
router.put('/about-content', auth, requireRole('admin'), cmsCtrl.updateAboutContent);

// ==================== EXECUTIVES ROUTES ====================

// Public routes - no authentication required
router.get('/executives', cmsCtrl.getExecutives);
router.get('/executives/:id', cmsCtrl.getExecutive);

// Admin routes - require authentication and admin role
router.post('/executives', auth, requireRole('admin'), cmsCtrl.createExecutive);
router.put('/executives/:id', auth, requireRole('admin'), cmsCtrl.updateExecutive);
router.delete('/executives/:id', auth, requireRole('admin'), cmsCtrl.deleteExecutive);
router.post('/executives/:id/image', auth, requireRole('admin'), uploadCmsExecutiveImage, cmsCtrl.uploadExecutiveImage);

// ==================== CONTACT INFO ROUTES ====================

// Public routes - no authentication required
router.get('/contact-info', cmsCtrl.getContactInfo);

// Admin routes - require authentication and admin role
router.put('/contact-info', auth, requireRole('admin'), cmsCtrl.updateContactInfo);

module.exports = router;
