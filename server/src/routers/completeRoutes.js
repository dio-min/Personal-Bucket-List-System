const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { addComplete } = require('./../controllers/completeController');

// Multer error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || "File upload error" });
  }
  next();
};

router.post('/addComplete', upload.single('image'), handleUploadError, addComplete);

module.exports = router;