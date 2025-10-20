// src/models/contactInfo.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContactInfo = sequelize.define('ContactInfo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Contact Details
  address_en: { type: DataTypes.TEXT, allowNull: false },
  address_am: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: false },
  phone2: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(100), allowNull: false },
  fax: { type: DataTypes.STRING(50) },
  po_box: { type: DataTypes.STRING(50) },
  
  // Location
  map_url: { type: DataTypes.TEXT },
  latitude: { type: DataTypes.DECIMAL(10, 8) },
  longitude: { type: DataTypes.DECIMAL(11, 8) },
  
  // Social Media
  facebook_url: { type: DataTypes.STRING(200) },
  twitter_url: { type: DataTypes.STRING(200) },
  linkedin_url: { type: DataTypes.STRING(200) },
  telegram_url: { type: DataTypes.STRING(200) },
  youtube_url: { type: DataTypes.STRING(200) },
  
  // Working Hours
  working_hours_en: { type: DataTypes.TEXT },
  working_hours_am: { type: DataTypes.TEXT },
  
  // Metadata
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_by: { type: DataTypes.INTEGER }
}, { 
  tableName: 'contact_info', 
  timestamps: false 
});

module.exports = ContactInfo;
