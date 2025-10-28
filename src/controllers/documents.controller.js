// src/controllers/documents.controller.js
const Document = require('../models/document.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.list = async (req, res) => {
  try {
    const { q, category, document_type, page = 1, per_page = 20, sort_by = 'created_at', order = 'DESC' } = req.query;
    const where = {};
    
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }
    
    if (category) where.category = category;
    if (document_type) where.document_type = document_type;
    
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    const { rows, count } = await Document.findAndCountAll({
      where,
      limit: parseInt(per_page),
      offset,
      order: [[sort_by, order.toUpperCase()]]
    });
    
    res.json({
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      category: req.body.category,
      document_type: req.body.document_type,
      file_url: req.body.file_url,
      file_name: req.body.file_name,
      file_size: req.body.file_size,
      tags: req.body.tags || [],
      description: req.body.description,
      is_public: req.body.is_public || false,
      created_by: req.user?.id
    };
    
    const created = await Document.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create document error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const updateData = {
      title: req.body.title,
      category: req.body.category,
      document_type: req.body.document_type,
      file_url: req.body.file_url,
      file_name: req.body.file_name,
      file_size: req.body.file_size,
      tags: req.body.tags,
      description: req.body.description,
      is_public: req.body.is_public
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await document.update(updateData);
    res.json(document);
  } catch (err) {
    console.error('Update document error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { confirm } = req.query;
    if (confirm !== 'true') {
      return res.status(400).json({ message: 'To delete set ?confirm=true' });
    }
    
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete physical file if exists
    if (document.file_url) {
      const filePath = path.join(__dirname, '../../', document.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await document.destroy();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

