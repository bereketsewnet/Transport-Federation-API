// src/middlewares/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const photosDir = path.join(__dirname, '../../uploads/photos');
const newsDir = path.join(__dirname, '../../uploads/news');
const cmsHeroDir = path.join(__dirname, '../../uploads/cms/hero');
const cmsExecutivesDir = path.join(__dirname, '../../uploads/cms/executives');

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}
if (!fs.existsSync(newsDir)) {
  fs.mkdirSync(newsDir, { recursive: true });
}
if (!fs.existsSync(cmsHeroDir)) {
  fs.mkdirSync(cmsHeroDir, { recursive: true });
}
if (!fs.existsSync(cmsExecutivesDir)) {
  fs.mkdirSync(cmsExecutivesDir, { recursive: true });
}

// Configure storage for photos
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, photosDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for news images
const newsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, newsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `news-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for CMS hero images
const cmsHeroStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, cmsHeroDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `hero-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for CMS executive images
const cmsExecutiveStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, cmsExecutivesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `executive-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer for photos
const uploadPhoto = multer({
  storage: photoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Configure multer for news images
const uploadNews = multer({
  storage: newsStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Configure multer for CMS hero images
const uploadCmsHero = multer({
  storage: cmsHeroStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Configure multer for CMS executive images
const uploadCmsExecutive = multer({
  storage: cmsExecutiveStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to handle optional photo upload (supports both file and URL)
const optionalPhotoUpload = (req, res, next) => {
  const uploadSingle = uploadPhoto.single('photo');
  
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    
    // If no file was uploaded, check if URL is provided
    if (!req.file && !req.body.image_url) {
      return res.status(400).json({ message: 'Either upload a photo file or provide an image_url' });
    }
    
    // Everything went fine
    next();
  });
};

// Middleware to handle optional news image upload (supports both file and URL)
const uploadNewsImage = (req, res, next) => {
  const uploadSingle = uploadNews.single('image');
  
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    
    // Image is optional for news, so just continue
    next();
  });
};

// Middleware to handle CMS hero image upload
const uploadCmsHeroImage = (req, res, next) => {
  const uploadSingle = uploadCmsHero.single('image');
  
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    
    // Image is required for hero upload
    if (!req.file) {
      return res.status(400).json({ message: 'Hero image is required' });
    }
    
    next();
  });
};

// Middleware to handle CMS executive image upload
const uploadCmsExecutiveImage = (req, res, next) => {
  const uploadSingle = uploadCmsExecutive.single('image');
  
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    
    // Image is required for executive upload
    if (!req.file) {
      return res.status(400).json({ message: 'Executive image is required' });
    }
    
    next();
  });
};

module.exports = {
  uploadPhoto,
  uploadNews,
  uploadCmsHero,
  uploadCmsExecutive,
  optionalPhotoUpload,
  uploadNewsImage,
  uploadCmsHeroImage,
  uploadCmsExecutiveImage
};

