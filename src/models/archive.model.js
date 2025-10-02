// src/models/archive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Archive = sequelize.define('Archive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mem_id: { type: DataTypes.INTEGER },
  union_id: { type: DataTypes.INTEGER },
  member_code: { type: DataTypes.STRING(100) },
  first_name: { type: DataTypes.STRING(200) },
  father_name: { type: DataTypes.STRING(200) },
  surname: { type: DataTypes.STRING(200) },
  sex: { type: DataTypes.STRING(10) },
  birthdate: { type: DataTypes.DATEONLY },
  education: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(255) },
  salary: { type: DataTypes.DECIMAL(12,2) },
  registry_date: { type: DataTypes.DATEONLY },
  resigned_date: { type: DataTypes.DATEONLY },
  reason: { type: DataTypes.TEXT },
  archived_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'archives', timestamps: false });

module.exports = Archive;
