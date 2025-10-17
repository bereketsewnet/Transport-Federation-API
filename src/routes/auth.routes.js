// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', authCtrl.login);
router.get('/security-questions', authCtrl.getSecurityQuestions); // Get list of security questions
router.post('/forgot-password/step1', authCtrl.forgotPasswordStep1); // Get user's security questions
router.post('/forgot-password/step2', authCtrl.forgotPasswordStep2); // Verify answers and reset

// Protected routes (requires auth)
router.post('/change-password', auth, authCtrl.changePassword); // Change password + set security questions

module.exports = router;
