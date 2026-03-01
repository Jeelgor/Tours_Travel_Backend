const { indexChunks } = require("../services/indexChunks");

const runIndexing = async (req, res) => {
  await indexChunks();
  res.json({ message: "Indexing completed" });
};

module.exports = { runIndexing };
