// src/models/executive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Executive = sequelize.define('Executive', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Names
  name_en: { type: DataTypes.STRING(200), allowNull: false },
  name_am: { type: DataTypes.STRING(200), allowNull: false },
  
  // Position/Title
  position_en: { type: DataTypes.STRING(200), allowNull: false },
  position_am: { type: DataTypes.STRING(200), allowNull: false },
  
  // Bio (optional)
  bio_en: { type: DataTypes.TEXT },
  bio_am: { type: DataTypes.TEXT },
  
  // Photo
  image: { type: DataTypes.STRING(500) },
  
  // Type: 'executive' or 'expert'
  type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'executive' },
  
  // Display order
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // Metadata
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by: { type: DataTypes.INTEGER }
}, { 
  tableName: 'executives', 
  timestamps: false 
});

module.exports = Executive;
