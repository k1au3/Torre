const axios = require('axios');

const searchJobs = async (req, res) => {
  try {
    const response = await axios.post(
      process.env.TORRE_JOB_SEARCH_URL,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'failed to fetch job search data' });
  }
};

module.exports = { searchJobs };
