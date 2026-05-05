const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('./../controllers/userController');   
// const { updateUsername } = require('../controllers/userController'); 
const getUserProfile = require('../controllers/userController').getUserProfile;

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/profile', getUserProfile);
// router.put('/updateUsername', updateUsername);

module.exports = router;