const express = require('express');
const router = express.Router();
const { searchPeople } = require('../controllers/peopleController');

router.post('/', searchPeople);

module.exports = router;