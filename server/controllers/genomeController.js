const axios = require('axios');

const getGenome = async (req, res) => {
  try {
    const { username } = req.params;
    const url = `${process.env.TORRE_GENOME_URL}/${username}`;
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'failed to fetch genome' });
  }
};

module.exports = { getGenome };