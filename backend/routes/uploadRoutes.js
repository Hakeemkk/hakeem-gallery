const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private
router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      console.error('❌ No file in upload request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    console.log(`📸 File uploaded: ${req.file.filename}`);
    
    // البيانات تُحفظ على Backend، لذلك ارجع Backend URL
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    console.log(`✅ Upload Response URL: ${fileUrl}`);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    next(error);
  }
});

// @desc    Upload design file for order
// @route   POST /api/upload/design
// @access  Private
router.post('/design', upload.single('designFile'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No design file uploaded'
      });
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
