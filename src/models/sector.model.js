// src/models/sector.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sector = sequelize.define('Sector', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'sectors', timestamps: false });

module.exports = Sector;

