const { searchTours } = require("../services/searchTours");

const semanticSearch = async (req, res) => {
  const { query } = req.body;

  const results = await searchTours(query);

  res.json(results);
};

module.exports = { semanticSearch };