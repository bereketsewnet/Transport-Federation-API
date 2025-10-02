// src/models/visitor.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Visitor = sequelize.define('Visitor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  visit_date: { type: DataTypes.DATEONLY, allowNull: false },
  count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'visitors', timestamps: false });

module.exports = Visitor;
