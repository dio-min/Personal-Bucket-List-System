const express = require('express');
const router = express.Router();
const { addItem} = require('./../controllers/goalController');   // ← Destructuring
const { getbyTitle} = require('./../controllers/goalController'); // ← Destructuring
const { updateDocument} = require('./../controllers/goalController'); // ← Destructuring
const {getItembyID} = require('./../controllers/goalController'); // ← Destructuring
const {updateStatus} = require('./../controllers/goalController'); // ← Destructuring

router.post('/addItem', addItem);
router.post('/getItemsByTitle', getbyTitle);
router.put('/updateDocument', updateDocument);
router.put('/updateStatus', updateStatus);
// In your routes file (e.g. goalRoutes.js or app.js)
router.post('/getItemByID', getItembyID); 
  // ← Important: :id


module.exports = router;