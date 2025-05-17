const multer = require('multer');
const path = require('path');

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in the "uploads" directory
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp-originalname (spaces removed)
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_').toLowerCase();
    cb(null, `${timestamp}-${safeName}`);
  }
});

// Filter only image files
const fileFilter = (req, file, cb) => {
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
  }
};

// Set size limit: 5MB per file
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
