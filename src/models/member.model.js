// src/models/member.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Union = require('./union.model');

const Member = sequelize.define('Member', {
  mem_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mem_uuid: { type: DataTypes.STRING(36) }, // set in seed or trigger
  union_id: { type: DataTypes.INTEGER, allowNull: true },
  member_code: { type: DataTypes.STRING(100), unique: true },
  first_name: { type: DataTypes.STRING(200), allowNull: false },
  father_name: { type: DataTypes.STRING(200) },
  surname: { type: DataTypes.STRING(200) },
  sex: { type: DataTypes.STRING(10) },
  birthdate: { type: DataTypes.DATEONLY },
  education: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(255) },
  salary: { type: DataTypes.DECIMAL(12,2) },
  registry_date: { type: DataTypes.DATEONLY },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'members', timestamps: false });

Member.belongsTo(Union, { foreignKey: 'union_id', as: 'union' });
module.exports = Member;
