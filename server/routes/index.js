const express = require('express');
const router = express.Router();

const peopleRoutes = require('./people');
const genomeRoutes = require('./genome');
const jobRoutes = require('./jobs');

router.use('/people-search', peopleRoutes);
router.use('/genome', genomeRoutes);
router.use('/job-search', jobRoutes);

module.exports = router;