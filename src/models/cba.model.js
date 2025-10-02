// src/models/cba.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CBA = sequelize.define('CBA', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_id: { type: DataTypes.INTEGER, allowNull: false },
  duration_years: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING(50) },
  registration_date: { type: DataTypes.DATEONLY },
  next_end_date: { type: DataTypes.DATEONLY },
  renewed_date: { type: DataTypes.DATEONLY },
  round: { type: DataTypes.STRING(20) },
  notes: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'cbas', timestamps: false });

module.exports = CBA;
