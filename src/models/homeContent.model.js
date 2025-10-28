// src/models/homeContent.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HomeContent = sequelize.define('HomeContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  heroTitleEn: { type: DataTypes.TEXT, field: 'hero_title_en', allowNull: false },
  heroTitleAm: { type: DataTypes.TEXT, field: 'hero_title_am', allowNull: false },
  heroSubtitleEn: { type: DataTypes.TEXT, field: 'hero_subtitle_en', allowNull: false },
  heroSubtitleAm: { type: DataTypes.TEXT, field: 'hero_subtitle_am', allowNull: false },
  heroImage: { type: DataTypes.STRING(500), field: 'hero_image' },
  overviewEn: { type: DataTypes.TEXT, field: 'overview_en', allowNull: false },
  overviewAm: { type: DataTypes.TEXT, field: 'overview_am', allowNull: false },
  stat1LabelEn: { type: DataTypes.STRING(100), field: 'stat1_label_en' },
  stat1LabelAm: { type: DataTypes.STRING(100), field: 'stat1_label_am' },
  stat1Value: { type: DataTypes.INTEGER, field: 'stat1_value' },
  stat2LabelEn: { type: DataTypes.STRING(100), field: 'stat2_label_en' },
  stat2LabelAm: { type: DataTypes.STRING(100), field: 'stat2_label_am' },
  stat2Value: { type: DataTypes.INTEGER, field: 'stat2_value' },
  stat3LabelEn: { type: DataTypes.STRING(100), field: 'stat3_label_en' },
  stat3LabelAm: { type: DataTypes.STRING(100), field: 'stat3_label_am' },
  stat3Value: { type: DataTypes.INTEGER, field: 'stat3_value' },
  stat4LabelEn: { type: DataTypes.STRING(100), field: 'stat4_label_en' },
  stat4LabelAm: { type: DataTypes.STRING(100), field: 'stat4_label_am' },
  stat4Value: { type: DataTypes.INTEGER, field: 'stat4_value' },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at', defaultValue: DataTypes.NOW },
  updatedBy: { type: DataTypes.INTEGER, field: 'updated_by' }
}, { 
  tableName: 'home_content', 
  timestamps: true 
});

module.exports = HomeContent;
