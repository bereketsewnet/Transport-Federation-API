// src/models/contact.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255) },
  email_or_phone: { type: DataTypes.STRING(255) },
  subject: { type: DataTypes.STRING(255) },
  message: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'contacts', timestamps: false });

module.exports = Contact;
