// src/models/photo.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Gallery = require('./gallery.model');

const Photo = sequelize.define('Photo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gallery_id: { type: DataTypes.INTEGER },
  filename: { type: DataTypes.STRING(255) },
  caption: { type: DataTypes.TEXT },
  taken_at: { type: DataTypes.DATEONLY },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'photos', timestamps: false });

Photo.belongsTo(Gallery, { foreignKey: 'gallery_id', as: 'gallery' });
module.exports = Photo;
