const express = require('express');
const router = express.Router();
const { addItem} = require('./../controllers/goalController');   // ← Destructuring
const { getbyTitle } = require('./../controllers/goalController'); // ← Destructuring

router.post('/addItem', addItem);
router.post('/getItemsByTitle', getbyTitle);

module.exports = router;