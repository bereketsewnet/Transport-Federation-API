// src/models/orgLeader.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrgLeader = sequelize.define('OrgLeader', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(50) },
  first_name: { type: DataTypes.STRING(200) },
  father_name: { type: DataTypes.STRING(200) },
  surname: { type: DataTypes.STRING(200) },
  position: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(255) },
  sector: { type: DataTypes.STRING(50) },
  organization: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'organization_leaders', timestamps: false });

module.exports = OrgLeader;
