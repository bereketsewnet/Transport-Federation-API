// src/models/loginAccount.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoginAccount = sequelize.define('LoginAccount', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mem_id: { type: DataTypes.INTEGER },
  username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  role: { type: DataTypes.STRING(50), defaultValue: 'member' }, // admin|member
  must_change_password: { type: DataTypes.BOOLEAN, defaultValue: true },
  
  // Security Questions (3 questions for password reset)
  security_question_1_id: { type: DataTypes.INTEGER }, // Question ID from config
  security_answer_1_hash: { type: DataTypes.TEXT },
  security_question_2_id: { type: DataTypes.INTEGER },
  security_answer_2_hash: { type: DataTypes.TEXT },
  security_question_3_id: { type: DataTypes.INTEGER },
  security_answer_3_hash: { type: DataTypes.TEXT },
  
  last_login: { type: DataTypes.DATE },
  is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
  password_reset_required: { type: DataTypes.BOOLEAN, defaultValue: false }, // Admin reset flag
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'login_accounts', timestamps: false });

module.exports = LoginAccount;
