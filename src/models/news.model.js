// src/models/news.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const News = sequelize.define('News', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.TEXT, allowNull: false },
  body: { type: DataTypes.TEXT },
  summary: { type: DataTypes.TEXT },
  published_at: { type: DataTypes.DATE },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
  image_filename: { type: DataTypes.STRING(500) },
  is_local: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'news', timestamps: false });

module.exports = News;
