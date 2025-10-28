// src/models/document.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false },
  document_type: { type: DataTypes.STRING(50), allowNull: false },
  file_url: { type: DataTypes.STRING(500), allowNull: false },
  file_name: { type: DataTypes.STRING(255) },
  file_size: { type: DataTypes.INTEGER },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  description: { type: DataTypes.TEXT },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_by: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'documents', timestamps: false });

module.exports = Document;

