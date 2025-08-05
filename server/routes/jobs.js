const express = require('express');
const router = express.Router();
const { searchJobs } = require('../controllers/jobController');

router.post('/', searchJobs);

module.exports = router;