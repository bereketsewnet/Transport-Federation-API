// src/controllers/news.controller.js
const News = require('../models/news.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.list = async (req,res) => {
  try {
    const { q, is_published, page=1, per_page=20 } = req.query;
    const where = {};
    if (q) where.title = { [Op.like]: `%${q}%` };
    if (typeof is_published !== 'undefined') where.is_published = is_published === 'true';
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await News.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [['published_at','DESC']] });
    
    // Add full image URL for local files
    const rowsWithImageUrl = rows.map(item => {
      const newsItem = item.toJSON();
      if (newsItem.is_local && newsItem.image_filename) {
        newsItem.image_url = `/uploads/news/${newsItem.image_filename}`;
      } else if (!newsItem.is_local && newsItem.image_filename) {
        newsItem.image_url = newsItem.image_filename; // It's already a URL
      }
      return newsItem;
    });
    
    res.json({ data: rowsWithImageUrl, meta: { total: count }});
  } catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req,res) => {
  try { 
    const item = await News.findByPk(req.params.id); 
    if(!item) return res.status(404).json({ message:'Not found' }); 
    
    // Add full image URL
    const newsItem = item.toJSON();
    if (newsItem.is_local && newsItem.image_filename) {
      newsItem.image_url = `/uploads/news/${newsItem.image_filename}`;
    } else if (!newsItem.is_local && newsItem.image_filename) {
      newsItem.image_url = newsItem.image_filename;
    }
    
    res.json(newsItem); 
  }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};

exports.create = async (req,res) => {
  try {
    // Validate required fields
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Support both file upload and URL string
    let filename;
    let isLocalFile = false;

    if (req.file) {
      // File was uploaded
      filename = req.file.filename;
      isLocalFile = true;
    } else if (req.body.image_url) {
      // URL was provided
      filename = req.body.image_url;
      isLocalFile = false;
    }
    // Image is optional, so no error if neither is provided

    // Prepare news data
    const newsData = {
      title: req.body.title.trim(),
      body: req.body.body ? req.body.body.trim() : null,
      summary: req.body.summary ? req.body.summary.trim() : null,
      published_at: req.body.published_at || null,
      is_published: req.body.is_published === 'true' || req.body.is_published === true || false,
      image_filename: filename || null,
      is_local: isLocalFile
    };

    const created = await News.create(newsData);
    
    // Include full URL in response for local files
    const newsResponse = created.toJSON();
    if (isLocalFile && filename) {
      newsResponse.image_url = `/uploads/news/${filename}`;
    } else if (!isLocalFile && filename) {
      newsResponse.image_url = filename;
    }
    
    res.status(201).json(newsResponse);
  } catch(err){ 
    // If file was uploaded but DB insert failed, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/news', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Create news error:', err); 
    res.status(400).json({ message: err.message || 'Failed to create news' }); 
  }
};

exports.update = async (req,res) => {
  try { 
    const found = await News.findByPk(req.params.id); 
    if(!found) return res.status(404).json({message:'Not found'}); 
    
    // Prepare update data
    const updateData = {};
    
    // Validate and update title if provided
    if (req.body.title !== undefined) {
      if (req.body.title.trim() === '') {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updateData.title = req.body.title.trim();
    }
    
    if (req.body.body !== undefined) {
      updateData.body = req.body.body ? req.body.body.trim() : null;
    }
    
    if (req.body.summary !== undefined) {
      updateData.summary = req.body.summary ? req.body.summary.trim() : null;
    }
    
    if (req.body.published_at !== undefined) {
      updateData.published_at = req.body.published_at;
    }
    
    if (req.body.is_published !== undefined) {
      updateData.is_published = req.body.is_published === 'true' || req.body.is_published === true;
    }

    // Handle image update
    if (req.file) {
      // New file uploaded - delete old local file if exists
      if (found.is_local && found.image_filename) {
        const oldFilePath = path.join(__dirname, '../../uploads/news', found.image_filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.image_filename = req.file.filename;
      updateData.is_local = true;
    } else if (req.body.image_url) {
      // New URL provided - delete old local file if exists
      if (found.is_local && found.image_filename) {
        const oldFilePath = path.join(__dirname, '../../uploads/news', found.image_filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.image_filename = req.body.image_url;
      updateData.is_local = false;
    } else if (req.body.remove_image === 'true' || req.body.remove_image === true) {
      // Remove image
      if (found.is_local && found.image_filename) {
        const oldFilePath = path.join(__dirname, '../../uploads/news', found.image_filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.image_filename = null;
      updateData.is_local = false;
    }
    
    await found.update(updateData); 
    
    // Add full image URL in response
    const newsResponse = found.toJSON();
    if (newsResponse.is_local && newsResponse.image_filename) {
      newsResponse.image_url = `/uploads/news/${newsResponse.image_filename}`;
    } else if (!newsResponse.is_local && newsResponse.image_filename) {
      newsResponse.image_url = newsResponse.image_filename;
    }
    
    res.json(newsResponse); 
  }
  catch(err){ 
    console.error('Update news error:', err); 
    res.status(400).json({ message: err.message || 'Failed to update news' }); 
  }
};

exports.remove = async (req,res) => {
  try { 
    if (req.query.confirm !== 'true') return res.status(400).json({ message:'To delete set ?confirm=true' }); 
    const found = await News.findByPk(req.params.id); 
    if(!found) return res.status(404).json({ message:'Not found' }); 
    
    // If it's a local file, delete it from filesystem
    if (found.is_local && found.image_filename) {
      const filePath = path.join(__dirname, '../../uploads/news', found.image_filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await found.destroy(); 
    res.json({ message:'Deleted' }); 
  }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};
