// src/models/gallery.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'galleries', timestamps: false });

module.exports = Gallery;
