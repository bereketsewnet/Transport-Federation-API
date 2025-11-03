// src/models/aboutContent.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AboutContent = sequelize.define('AboutContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Mission & Vision
  mission_en: { type: DataTypes.TEXT, allowNull: false },
  mission_am: { type: DataTypes.TEXT, allowNull: false },
  vision_en: { type: DataTypes.TEXT, allowNull: false },
  vision_am: { type: DataTypes.TEXT, allowNull: false },
  
  // About Us Description
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_am: { type: DataTypes.TEXT, allowNull: true },
  
  // Values (JSON arrays)
  values_en: { type: DataTypes.JSON, defaultValue: [] },
  values_am: { type: DataTypes.JSON, defaultValue: [] },
  
  // History
  history_en: { type: DataTypes.TEXT, allowNull: false },
  history_am: { type: DataTypes.TEXT, allowNull: false },
  
  // Objectives (JSON arrays)
  objectives_en: { type: DataTypes.JSON, defaultValue: [] },
  objectives_am: { type: DataTypes.JSON, defaultValue: [] },
  
  // Structure
  structure_title_en: { type: DataTypes.STRING(200) },
  structure_title_am: { type: DataTypes.STRING(200) },
  structure_departments_en: { type: DataTypes.JSON, defaultValue: [] },
  structure_departments_am: { type: DataTypes.JSON, defaultValue: [] },
  
  // Stakeholders
  stakeholders_title_en: { type: DataTypes.STRING(200) },
  stakeholders_title_am: { type: DataTypes.STRING(200) },
  stakeholders_list_en: { type: DataTypes.JSON, defaultValue: [] },
  stakeholders_list_am: { type: DataTypes.JSON, defaultValue: [] },
  
  // Metadata
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_by: { type: DataTypes.INTEGER }
}, { 
  tableName: 'about_content', 
  timestamps: false 
});

module.exports = AboutContent;
