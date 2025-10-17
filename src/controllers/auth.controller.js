// src/controllers/auth.controller.js
const LoginAccount = require('../models/loginAccount.model');
const Member = require('../models/member.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECURITY_QUESTIONS } = require('../config/securityQuestions');
require('dotenv').config();

// Login endpoint
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  try {
    const user = await LoginAccount.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    
    if (user.is_locked) return res.status(403).json({ message: 'Account locked. Contact administrator.' });

    // Check if user needs to change password (first time or admin reset)
    if (user.must_change_password || user.password_reset_required) {
      // Generate temporary token for password change
      const tempPayload = { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        temp: true, // Temporary token flag
        requirePasswordChange: true
      };
      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET, { expiresIn: '30m' });
      
      // Check if security questions are set
      const hasSecurityQuestions = user.security_question_1_id && 
                                   user.security_question_2_id && 
                                   user.security_question_3_id;
      
      return res.json({
        tempToken,
        requirePasswordChange: true,
        requireSecurityQuestions: !hasSecurityQuestions,
        message: 'Password change required. Please change your password and set security questions.'
      });
    }

    // Normal login - generate full access token
    const payload = { 
      id: user.id, 
      mem_id: user.mem_id,
      username: user.username, 
      role: user.role 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    // Update last_login
    user.last_login = new Date();
    await user.save();

    return res.json({ 
      token, 
      user: payload,
      message: 'Login successful'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Change password (first time or after admin reset)
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, securityQuestions } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get user from JWT (temp token)
    const user = await LoginAccount.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.password_hash = passwordHash;
    user.must_change_password = false;
    user.password_reset_required = false;

    // If security questions provided, save them
    if (securityQuestions && Array.isArray(securityQuestions) && securityQuestions.length === 3) {
      for (let i = 0; i < 3; i++) {
        const { questionId, answer } = securityQuestions[i];
        if (!questionId || !answer) {
          return res.status(400).json({ message: '3 security questions with answers required' });
        }
        
        const answerHash = await bcrypt.hash(answer.toLowerCase().trim(), 12);
        user[`security_question_${i + 1}_id`] = questionId;
        user[`security_answer_${i + 1}_hash`] = answerHash;
      }
    } else if (!user.security_question_1_id) {
      // If no security questions provided and none exist, require them
      return res.status(400).json({ 
        message: 'Security questions required. Please provide 3 security questions with answers.',
        requireSecurityQuestions: true
      });
    }

    await user.save();

    // Generate new full-access token
    const payload = { 
      id: user.id, 
      mem_id: user.mem_id,
      username: user.username, 
      role: user.role 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    return res.json({
      token,
      user: payload,
      message: 'Password changed successfully. You can now use the system.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get available security questions
exports.getSecurityQuestions = async (req, res) => {
  try {
    return res.json({ questions: SECURITY_QUESTIONS });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - Step 1: Verify username and show security questions
exports.forgotPasswordStep1 = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'username required' });

    const user = await LoginAccount.findOne({ where: { username } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(404).json({ message: 'If this account exists, security questions will be shown.' });
    }

    // Check if security questions are set
    if (!user.security_question_1_id || !user.security_question_2_id || !user.security_question_3_id) {
      return res.status(400).json({ 
        message: 'Security questions not set. Please contact administrator to reset password.'
      });
    }

    // Return the questions (not the answers!)
    const questions = SECURITY_QUESTIONS;
    const userQuestions = [
      { questionId: user.security_question_1_id, question: questions.find(q => q.id === user.security_question_1_id)?.question },
      { questionId: user.security_question_2_id, question: questions.find(q => q.id === user.security_question_2_id)?.question },
      { questionId: user.security_question_3_id, question: questions.find(q => q.id === user.security_question_3_id)?.question }
    ];

    return res.json({
      username: user.username,
      securityQuestions: userQuestions,
      message: 'Please answer all 3 security questions'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - Step 2: Verify answers and reset password
exports.forgotPasswordStep2 = async (req, res) => {
  try {
    const { username, answers, newPassword } = req.body;
    
    if (!username || !answers || !Array.isArray(answers) || answers.length !== 3 || !newPassword) {
      return res.status(400).json({ message: 'username, 3 answers, and newPassword required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await LoginAccount.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Invalid request' });
    }

    // Verify all 3 answers
    for (let i = 0; i < 3; i++) {
      const answerHash = user[`security_answer_${i + 1}_hash`];
      if (!answerHash) {
        return res.status(400).json({ message: 'Security questions not properly configured' });
      }
      
      const answerMatch = await bcrypt.compare(answers[i].toLowerCase().trim(), answerHash);
      if (!answerMatch) {
        return res.status(401).json({ message: 'Security answers do not match' });
      }
    }

    // All answers correct - reset password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.password_hash = passwordHash;
    user.must_change_password = false;
    user.password_reset_required = false;
    await user.save();

    return res.json({
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
