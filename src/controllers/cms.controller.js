// src/controllers/cms.controller.js
const HomeContent = require('../models/homeContent.model');
const AboutContent = require('../models/aboutContent.model');
const Executive = require('../models/executive.model');
const ContactInfo = require('../models/contactInfo.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Helper function to convert snake_case to camelCase
function toCamelCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(value);
  }
  return result;
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(value);
  }
  return result;
}

// ==================== HOME CONTENT ====================

exports.getHomeContent = async (req, res) => {
  try {
    let homeContent = await HomeContent.findOne();
    
    // If no content exists, create default
    if (!homeContent) {
      homeContent = await HomeContent.create({
        hero_title_en: 'Transport & Communication Workers Federation',
        hero_title_am: 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን',
        hero_subtitle_en: 'Empowering workers across Ethiopia\'s transport and communication sectors',
        hero_subtitle_am: 'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሰራተኞችን አቅም ማሳደግ',
        overview_en: 'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation representing workers in the transport and communication sectors.',
        overview_am: 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን (TCWF) በትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን የሚወክል የብሔራዊ የሠራተኛ ማኅበር ፌዴሬሽን ነው።',
        stat1_label_en: 'Active Members',
        stat1_label_am: 'ንቁ አባላት',
        stat1_value: 1250,
        stat2_label_en: 'Worker Unions',
        stat2_label_am: 'የሰራተኛ ማህበራት',
        stat2_value: 19,
        stat3_label_en: 'Years of Service',
        stat3_label_am: 'የአገልግሎት ዓመታት',
        stat3_value: 50,
        stat4_label_en: 'Protection Rate (%)',
        stat4_label_am: 'የጥበቃ መጠን (%)',
        stat4_value: 100
      });
    }
    
    const response = toCamelCase(homeContent.toJSON());
    
    // Remove member count statistics (stat1) as requested
    delete response.stat1LabelEn;
    delete response.stat1LabelAm;
    delete response.stat1Value;
    
    // Add full image URL if hero image exists
    if (response.heroImage) {
      response.heroImageUrl = `/uploads/cms/hero/${response.heroImage}`;
    }
    
    res.json({ data: response });
  } catch (error) {
    console.error('Get home content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHomeContent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    updateData.updatedBy = req.user.id;
    
    let homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      // Create new if doesn't exist
      homeContent = await HomeContent.create(updateData);
    } else {
      await homeContent.update(updateData);
    }
    
    // Reload from database to get fresh data
    await homeContent.reload();
    
    const response = toCamelCase(homeContent.toJSON());
    
    // Add full image URL if hero image exists
    if (response.heroImage) {
      response.heroImageUrl = `/uploads/cms/hero/${response.heroImage}`;
    }
    
    res.json({ 
      message: 'Home content updated successfully',
      data: response 
    });
  } catch (error) {
    console.error('Update home content error:', error);
    res.status(400).json({ message: error.message || 'Failed to update home content' });
  }
};

exports.uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const filename = req.file.filename;
    
    // Update home content with new image
    let homeContent = await HomeContent.findOne();
    if (!homeContent) {
      homeContent = await HomeContent.create({ hero_image: filename });
    } else {
      // Delete old image if exists
      if (homeContent.hero_image) {
        const oldFilePath = path.join(__dirname, '../../uploads/cms/hero', homeContent.hero_image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      await homeContent.update({ hero_image: filename });
    }
    
    res.json({
      message: 'Hero image uploaded successfully',
      imageUrl: `/uploads/cms/hero/${filename}`
    });
  } catch (error) {
    // Delete uploaded file if database update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/cms/hero', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Upload hero image error:', error);
    res.status(400).json({ message: error.message || 'Failed to upload hero image' });
  }
};

// ==================== ABOUT CONTENT ====================

exports.getAboutContent = async (req, res) => {
  try {
    let aboutContent = await AboutContent.findOne();
    
    // If no content exists, create default
    if (!aboutContent) {
      aboutContent = await AboutContent.create({
        mission_en: 'To organize workers in unions and federations to protect their rights and improve their working conditions.',
        mission_am: 'ሠራተኛዉን በማኅበርና ፌዴሬሽን ውስጥ በማደራጀት የእነሱን መብት በመጠበቅና የስራ ሁኔታቸውን በማሻሻል።',
        vision_en: 'To see workers with guaranteed rights, fair wages, and safe working conditions across all transport and communication sectors.',
        vision_am: 'የሥራ ዋስትናው የተረጋገጠ፣ ፍትሃዊ ደሞዝ፣ እና ደህንነቱ የተጠበቀ የስራ ሁኔታ ያላቸው ሠራተኞች በሁሉም የትራንስፖርትና መገናኛ ዘርፎች ውስጥ እንዲታዩ።',
        description_en: 'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation representing workers across Ethiopia\'s transport and communication sectors. Established with the mission to organize, protect, and empower workers, TCWF works tirelessly to ensure fair wages, safe working conditions, and the protection of workers\' rights. Through strategic partnerships, advocacy, and capacity building programs, we strive to create a better working environment for all workers in the transport and communication industries.',
        description_am: 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን (TCWF) በኢትዮጵያ ውስጥ በትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን የሚወክል የብሔራዊ የሠራተኛ ማኅበር ፌዴሬሽን ነው። ሠራተኞችን ማደራጀት፣ መጠበቅ እና አቅማቸውን ማሳደግ የሚለውን ተልዕኮ ከያዘ በኋላ የተመሠረተው TCWF ፍትሃዊ ደሞዞች፣ ደህንነቱ የተጠበቀ የስራ ሁኔታዎች እና የሠራተኞች መብቶችን የመጠበቅ ዓላማ እየኖረ ነው። በተዋጣረ ዕምነት፣ ድጋፍ እና አቅም ገንቢ ፕሮግራሞች በኩል በትራንስፖርትና መገናኛ ኢንዱስትሪዎች ውስጥ ለሁሉም ሠራተኞች የተሻለ የስራ አካባቢ ለመፍጠር እየተጋነን ነን።',
        values_en: ['Humanity', 'Commitment', 'Democratic Culture', 'Transparency', 'Unity'],
        values_am: ['ሰበዓዊነት', 'ቁርጠኝነት', 'የዲሞክራሲ ባህል', 'ግልጽነት', 'አንድነት'],
        history_en: 'The Industrial Federation of Transport and Communication Workers of Ethiopia was established to represent and protect the rights of workers in these vital sectors.',
        history_am: 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን በእነዚህ አስፈላጊ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን ለመወከልና መብታቸውን ለመጠበቅ ተመሠርቷል።',
        objectives_en: ['To organize unions and federations', 'To protect workers rights', 'To improve working conditions', 'To provide training and education'],
        objectives_am: ['በአገሪቱ የአሠሪና ሠራተኛ ግንኙነት ውስጥ የሠራተኛውን አቅም ማሳደግ', 'የሠራተኛውን መብት መጠበቅ', 'የስራ ሁኔታ ማሻሻል', 'ስልጠናና ትምህርት መስጠት'],
        structure_title_en: 'Federation Structure',
        structure_title_am: 'የፌዴሬሽኑ አወቃቀር',
        structure_departments_en: ['President', 'Secretary General', 'Treasurer', 'Organizing Secretary'],
        structure_departments_am: ['ፕሬዝዳንት', 'ዋና ፀሀፊ', 'ክፍያ አስተዳዳሪ', 'የማደራጀት ፀሀፊ'],
        stakeholders_title_en: 'Key Stakeholders',
        stakeholders_title_am: 'ባለድርሻ አካላት',
        stakeholders_list_en: ['Affiliated basic unions', 'Peer Federations', 'Government agencies', 'International organizations'],
        stakeholders_list_am: ['በፌዴሬሽኑ ሥር የተደራጁ መሰረታዊ ማኅበራት', 'አቻ ፌዴሬሽኖች', 'የመንግሥት አገልግሎቶች', 'ዓለም አቀፍ ድርጅቶች']
      });
    }
    
    const response = toCamelCase(aboutContent.toJSON());
    res.json({ data: response });
  } catch (error) {
    console.error('Get about content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAboutContent = async (req, res) => {
  try {
    const updateData = toSnakeCase(req.body);
    updateData.updated_by = req.user.id;
    
    let aboutContent = await AboutContent.findOne();
    
    if (!aboutContent) {
      // Create new if doesn't exist
      aboutContent = await AboutContent.create(updateData);
    } else {
      // Update existing
      await aboutContent.update(updateData);
    }
    
    const response = toCamelCase(aboutContent.toJSON());
    res.json({ 
      message: 'About content updated successfully',
      data: response 
    });
  } catch (error) {
    console.error('Update about content error:', error);
    res.status(400).json({ message: error.message || 'Failed to update about content' });
  }
};

// ==================== EXECUTIVES ====================

exports.getExecutives = async (req, res) => {
  try {
    const { type, page = 1, per_page = 20 } = req.query;
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    const { rows, count } = await Executive.findAndCountAll({
      where,
      limit: parseInt(per_page),
      offset,
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });
    
    const executives = rows.map(executive => {
      const exec = toCamelCase(executive.toJSON());
      if (exec.image) {
        exec.imageUrl = `/uploads/cms/executives/${exec.image}`;
      }
      return exec;
    });
    
    res.json({
      data: executives,
      meta: {
        total: count,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });
  } catch (error) {
    console.error('Get executives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExecutive = async (req, res) => {
  try {
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    
    const response = toCamelCase(executive.toJSON());
    if (response.image) {
      response.imageUrl = `/uploads/cms/executives/${response.image}`;
    }
    
    res.json({ data: response });
  } catch (error) {
    console.error('Get executive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExecutive = async (req, res) => {
  try {
    const executiveData = toSnakeCase(req.body);
    executiveData.created_by = req.user.id;
    
    const executive = await Executive.create(executiveData);
    const response = toCamelCase(executive.toJSON());
    
    if (response.image) {
      response.imageUrl = `/uploads/cms/executives/${response.image}`;
    }
    
    res.status(201).json({
      message: 'Executive created successfully',
      data: response
    });
  } catch (error) {
    console.error('Create executive error:', error);
    res.status(400).json({ message: error.message || 'Failed to create executive' });
  }
};

exports.updateExecutive = async (req, res) => {
  try {
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    
    const updateData = toSnakeCase(req.body);
    await executive.update(updateData);
    
    const response = toCamelCase(executive.toJSON());
    if (response.image) {
      response.imageUrl = `/uploads/cms/executives/${response.image}`;
    }
    
    res.json({
      message: 'Executive updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Update executive error:', error);
    res.status(400).json({ message: error.message || 'Failed to update executive' });
  }
};

exports.deleteExecutive = async (req, res) => {
  try {
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    
    // Delete image file if exists
    if (executive.image) {
      const filePath = path.join(__dirname, '../../uploads/cms/executives', executive.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await executive.destroy();
    res.json({ message: 'Executive deleted successfully' });
  } catch (error) {
    console.error('Delete executive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadExecutiveImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    
    const filename = req.file.filename;
    
    // Delete old image if exists
    if (executive.image) {
      const oldFilePath = path.join(__dirname, '../../uploads/cms/executives', executive.image);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    await executive.update({ image: filename });
    
    res.json({
      message: 'Executive image uploaded successfully',
      imageUrl: `/uploads/cms/executives/${filename}`
    });
  } catch (error) {
    // Delete uploaded file if database update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/cms/executives', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Upload executive image error:', error);
    res.status(400).json({ message: error.message || 'Failed to upload executive image' });
  }
};

// ==================== CONTACT INFO ====================

exports.getContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    
    // If no contact info exists, create default
    if (!contactInfo) {
      contactInfo = await ContactInfo.create({
        address_en: 'Addis Ababa, Ethiopia',
        address_am: 'አዲስ አበባ፣ ኢትዮጵያ',
        phone: '+251-11-XXX-XXXX',
        email: 'info@tcwf-ethiopia.org',
        working_hours_en: 'Monday - Friday: 8:30 AM - 5:00 PM',
        working_hours_am: 'ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት'
      });
    }
    
    const response = toCamelCase(contactInfo.toJSON());
    res.json({ data: response });
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const updateData = toSnakeCase(req.body);
    updateData.updated_by = req.user.id;
    
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      // Create new if doesn't exist
      contactInfo = await ContactInfo.create(updateData);
    } else {
      // Update existing
      await contactInfo.update(updateData);
    }
    
    const response = toCamelCase(contactInfo.toJSON());
    res.json({ 
      message: 'Contact info updated successfully',
      data: response 
    });
  } catch (error) {
    console.error('Update contact info error:', error);
    res.status(400).json({ message: error.message || 'Failed to update contact info' });
  }
};
