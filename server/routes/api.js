const express = require('express');
const axios = require('axios');
const router = express.Router();

const TORRE_JOB_SEARCH_URL = 'https://search.torre.co/opportunities/_search';
const TORRE_GENOME_URL = 'https://torre.ai/api/genome/bios';

// Rate limiter configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const requestCounts = {};

// Simple rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 0,
      resetTime: Date.now() + RATE_LIMIT_WINDOW
    };
  }

  if (Date.now() > requestCounts[ip].resetTime) {
    requestCounts[ip] = {
      count: 0,
      resetTime: Date.now() + RATE_LIMIT_WINDOW
    };
  }

  if (requestCounts[ip].count >= MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }

  requestCounts[ip].count++;
  next();
};

// Apply rate limiting to all routes
router.use(rateLimiter);

router.post('/job-search', async (req, res) => {
  try {
    const { keywords, experience = 'potential-to-develop', limit = 20 } = req.body;
    
    // Validate input
    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      return res.status(400).json({ error: 'Valid keywords are required' });
    }

    if (limit > 100) {
      return res.status(400).json({ error: 'Maximum limit is 100' });
    }

    const payload = {
      size: parseInt(limit, 10),
      and: [
        {
          'skill/role': {
            text: keywords.trim(),
            experience: experience
          }
        }
      ]
    };

    const response = await axios.post(TORRE_JOB_SEARCH_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': process.env.USER_AGENT || 'TorreDualApp/1.0 (Production)'
      },
      timeout: 10000 // 10 seconds timeout
    });

    const jobs = (response.data.results || []).map(job => ({
      id: job.id,
      objective: job.objective,
      type: job.type,
      remote: job.remote,
      location: job.locations?.[0]?.name || 'Unknown',
      organization: job.organizations?.[0] || {},
      skills: job.skills || [],
      compensation: job.compensation,
      deadline: job.deadline
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Job search error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // TalentMatch API error response
      res.status(error.response.status).json({ 
        error: 'TalentMatch API error',
        details: error.response.data 
      });
    } else if (error.request) {
      // No response received
      res.status(504).json({ 
        error: 'TalentMatch API request timeout',
        details: 'No response received from TalentMatch API'
      });
    } else {
      // Other errors
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

router.get('/genome/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validate username format
    if (!username || !/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }

    const response = await axios.get(`${TORRE_GENOME_URL}/${username}`, {
      headers: {
        'User-Agent': process.env.USER_AGENT || 'TorreDualApp/1.0 (Production)'
      },
      timeout: 10000 // 10 seconds timeout
    });

    res.json(response.data);
  } catch (error) {
    console.error('Genome fetch error:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        res.status(404).json({ 
          error: 'User not found',
          details: 'The requested username does not exist on TalentMatch'
        });
      } else {
        res.status(error.response.status).json({ 
          error: 'TalentMatch API error',
          details: error.response.data 
        });
      }
    } else if (error.request) {
      res.status(504).json({ 
        error: 'TalentMatch API request timeout',
        details: 'No response received from TalentMatch API'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

module.exports = router;