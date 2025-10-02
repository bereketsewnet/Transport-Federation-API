// src/models/terminatedUnion.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TerminatedUnion = sequelize.define('TerminatedUnion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_id: { type: DataTypes.INTEGER },
  name_en: { type: DataTypes.TEXT },
  name_am: { type: DataTypes.TEXT },
  sector: { type: DataTypes.STRING(50) },
  organization: { type: DataTypes.TEXT },
  established_date: { type: DataTypes.DATEONLY },
  terms_of_election: { type: DataTypes.INTEGER },
  general_assembly_date: { type: DataTypes.DATEONLY },
  strategic_plan_in_place: { type: DataTypes.BOOLEAN },
  external_audit_date: { type: DataTypes.DATEONLY },
  terminated_date: { type: DataTypes.DATEONLY },
  termination_reason: { type: DataTypes.TEXT },
  archived_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'terminated_unions', timestamps: false });

module.exports = TerminatedUnion;
