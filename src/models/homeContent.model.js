// src/models/homeContent.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HomeContent = sequelize.define('HomeContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Hero Section
  hero_title_en: { type: DataTypes.TEXT, allowNull: false },
  hero_title_am: { type: DataTypes.TEXT, allowNull: false },
  hero_subtitle_en: { type: DataTypes.TEXT, allowNull: false },
  hero_subtitle_am: { type: DataTypes.TEXT, allowNull: false },
  
  // Overview Section
  overview_en: { type: DataTypes.TEXT, allowNull: false },
  overview_am: { type: DataTypes.TEXT, allowNull: false },
  
  // Statistics
  stat1_label_en: { type: DataTypes.STRING(100) },
  stat1_label_am: { type: DataTypes.STRING(100) },
  stat1_value: { type: DataTypes.INTEGER },
  
  stat2_label_en: { type: DataTypes.STRING(100) },
  stat2_label_am: { type: DataTypes.STRING(100) },
  stat2_value: { type: DataTypes.INTEGER },
  
  stat3_label_en: { type: DataTypes.STRING(100) },
  stat3_label_am: { type: DataTypes.STRING(100) },
  stat3_value: { type: DataTypes.INTEGER },
  
  stat4_label_en: { type: DataTypes.STRING(100) },
  stat4_label_am: { type: DataTypes.STRING(100) },
  stat4_value: { type: DataTypes.INTEGER },
  
  // Hero Image
  hero_image: { type: DataTypes.STRING(500) },
  
  // Metadata
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_by: { type: DataTypes.INTEGER }
}, { 
  tableName: 'home_content', 
  timestamps: false 
});

module.exports = HomeContent;
