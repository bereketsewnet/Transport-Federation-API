// src/models/unionExecutive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UnionExecutive = sequelize.define('UnionExecutive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_id: { type: DataTypes.INTEGER, allowNull: false },
  mem_id: { type: DataTypes.INTEGER },
  position: { type: DataTypes.STRING(100) },
  appointed_date: { type: DataTypes.DATEONLY },
  term_start_date: { type: DataTypes.DATEONLY },
  term_end_date: { type: DataTypes.DATEONLY },
  term_length_years: { type: DataTypes.INTEGER },
  is_current: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'union_executives', timestamps: false });

module.exports = UnionExecutive;
