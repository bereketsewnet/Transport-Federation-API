// src/models/union.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Union = sequelize.define('Union', {
  union_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_code: { type: DataTypes.STRING(50), unique: true },
  name_en: { type: DataTypes.TEXT, allowNull: false },
  name_am: { type: DataTypes.TEXT },
  sector: { type: DataTypes.STRING(50) },
  organization: { type: DataTypes.TEXT },
  established_date: { type: DataTypes.DATEONLY },
  terms_of_election: { type: DataTypes.INTEGER },
  general_assembly_date: { type: DataTypes.DATEONLY },
  strategic_plan_in_place: { type: DataTypes.BOOLEAN, defaultValue: false },
  external_audit_date: { type: DataTypes.DATEONLY },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'unions', timestamps: false });

module.exports = Union;
