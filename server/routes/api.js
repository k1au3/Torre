const express = require('express');
const axios = require('axios');
const router = express.Router();

const TORRE_JOB_SEARCH_URL = 'https://search.torre.co/opportunities/_search';

router.post('/job-search', async (req, res) => {
  try {
    const { keywords, experience = 'potential-to-develop', limit = 100 } = req.body;
    
    if (!keywords) {
      return res.status(400).json({ error: 'Keywords are required' });
    }

    const payload = {
      size: parseInt(limit, 10),
      and: [
        {
          'skill/role': {
            text: keywords,
            experience: experience
          }
        }
      ]
    };

    const response = await axios.post(TORRE_JOB_SEARCH_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TorreDualApp/1.0'
      }
    });

    // Update the job location mapping
    const jobs = (response.data.results || []).map(job => ({
      id: job.id,
      objective: job.objective,
      type: job.type,
      remote: job.remote,
      // Fix: Extract location name instead of full object
      location: job.locations?.[0]?.name || 'Unknown',
      organization: job.organizations?.[0] || {},
      skills: job.skills || [],
      compensation: job.compensation,
      deadline: job.deadline
}));

    res.json(jobs);
  } catch (error) {
    console.error('Job search error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search jobs',
      details: error.response?.data || error.message 
    });
  }
});

router.get('/genome/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`https://torre.ai/api/genome/bios/${username}`);
    res.json(response.data);
  } catch (error) {
    console.error('Genome fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch genome data',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;