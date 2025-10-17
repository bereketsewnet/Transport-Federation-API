// src/controllers/photos.controller.js
const Photo = require('../models/photo.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.list = async (req,res) => {
  try {
    const { gallery_id, q, page=1, per_page=20 } = req.query;
    const where = {};
    if (gallery_id) where.gallery_id = gallery_id;
    if (q) where.caption = { [Op.like]: `%${q}%` };
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(per_page);
    const { rows, count } = await Photo.findAndCountAll({ where, limit: parseInt(per_page), offset, order: [['created_at','DESC']] });
    res.json({ data: rows, meta: { total: count }});
  } catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};

exports.getById = async (req,res) => {
  try { const item = await Photo.findByPk(req.params.id); if(!item) return res.status(404).json({ message:'Not found' }); res.json(item); }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};

exports.create = async (req,res) => {
  try {
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
    } else {
      return res.status(400).json({ message: 'Either upload a photo file or provide an image_url' });
    }

    // Prepare photo data
    const photoData = {
      gallery_id: req.body.gallery_id,
      filename: filename,
      caption: req.body.caption || null,
      taken_at: req.body.taken_at || null,
      is_local: isLocalFile
    };

    const created = await Photo.create(photoData);
    
    // Include full URL in response for local files
    if (isLocalFile) {
      const photoResponse = created.toJSON();
      photoResponse.image_url = `/uploads/photos/${filename}`;
      return res.status(201).json(photoResponse);
    }
    
    res.status(201).json(created);
  } catch(err){ 
    // If file was uploaded but DB insert failed, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/photos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error(err); 
    res.status(400).json({ message: err.message }); 
  }
};

exports.update = async (req,res) => {
  try { 
    const found = await Photo.findByPk(req.params.id); 
    if(!found) return res.status(404).json({ message:'Not found' }); 
    
    // Allow updating caption and taken_at, but not the filename
    const updateData = {};
    if (req.body.caption !== undefined) updateData.caption = req.body.caption;
    if (req.body.taken_at !== undefined) updateData.taken_at = req.body.taken_at;
    
    await found.update(updateData); 
    res.json(found); 
  }
  catch(err){ console.error(err); res.status(400).json({ message: err.message }); }
};

exports.remove = async (req,res) => {
  try { 
    if (req.query.confirm !== 'true') return res.status(400).json({ message:'To delete set ?confirm=true' }); 
    const found = await Photo.findByPk(req.params.id); 
    if(!found) return res.status(404).json({ message:'Not found' }); 
    
    // If it's a local file, delete it from filesystem
    if (found.is_local) {
      const filePath = path.join(__dirname, '../../uploads/photos', found.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await found.destroy(); 
    res.json({ message:'Deleted' }); 
  }
  catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
};
