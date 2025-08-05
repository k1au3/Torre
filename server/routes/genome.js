const express = require('express');
const router = express.Router();
const { getGenome } = require('../controllers/genomeController');

router.get('/:username', getGenome);

module.exports = router;