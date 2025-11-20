// src/models/discipline.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Union = require('./union.model');
const Member = require('./member.model');

const Discipline = sequelize.define('Discipline', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  union_id: { type: DataTypes.INTEGER, allowNull: false },
  mem_id: { type: DataTypes.INTEGER, allowNull: false },
  discipline_case: { 
    type: DataTypes.ENUM('Warning', 'Salary Penalty', 'Work Suspension', 'Termination'),
    allowNull: false
  },
  reason_of_discipline: { type: DataTypes.TEXT, allowNull: false },
  date_of_action_taken: { type: DataTypes.DATEONLY, allowNull: false },
  judiciary_intermediate: { type: DataTypes.BOOLEAN, defaultValue: false },
  resolution_method: { 
    type: DataTypes.ENUM('Social Dialog', 'Judiciary Body'),
    allowNull: true
  },
  verdict_for: { 
    type: DataTypes.ENUM('Worker', 'Employer'),
    allowNull: true
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
  tableName: 'disciplines', 
  timestamps: false 
});

Discipline.belongsTo(Union, { foreignKey: 'union_id', as: 'union' });
Discipline.belongsTo(Member, { foreignKey: 'mem_id', as: 'member' });

module.exports = Discipline;

