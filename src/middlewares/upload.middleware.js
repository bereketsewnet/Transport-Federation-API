// src/middlewares/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `photo-${uniqueSuffix}${ext}`);
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to handle optional file upload (supports both file and URL)
const optionalPhotoUpload = (req, res, next) => {
  const uploadSingle = upload.single('photo');
  
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

module.exports = {
  upload,
  optionalPhotoUpload
};

