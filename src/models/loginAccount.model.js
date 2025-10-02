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
  security_question: { type: DataTypes.TEXT },
  security_answer_hash: { type: DataTypes.TEXT },
  last_login: { type: DataTypes.DATE },
  is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'login_accounts', timestamps: false });

module.exports = LoginAccount;
