// src/models/reportCache.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReportCache = sequelize.define('ReportCache', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  report_name: { type: DataTypes.STRING(255) },
  payload: { type: DataTypes.JSON },
  generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'reports_cache', timestamps: false });

module.exports = ReportCache;
