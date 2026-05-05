const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const { loginUser, registerUser } = require('./../controllers/userController');   

const { getUserProfile, updateUserProfile, updateUserName } = require('../controllers/userController');



const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || "File upload error" });
  }
  next();
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/profile', getUserProfile);
router.post('/uploadAvatar', upload.single("avatar"),handleUploadError, updateUserProfile);
router.post('/username', updateUserName);

module.exports = router;