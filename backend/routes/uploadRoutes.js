const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// @route   POST /api/uploads/single
// @desc    Upload a single file
// @access  Private
router.post('/single', auth, upload.single('photos'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No file uploaded' 
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      status: 'success',
      url: fileUrl 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error uploading file',
      error: error.message 
    });
  }
});

module.exports = router; 