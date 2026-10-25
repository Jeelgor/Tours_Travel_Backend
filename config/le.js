const { generateEmbedding } = require("../services/localEmbedding");

const indexChunks = async (chunks = []) => {
  if (!Array.isArray(chunks)) return;
  for (const chunk of chunks) {
    if (chunk && chunk.text) {
      const embedding = await generateEmbedding(chunk.text);
      chunk.embedding = embedding;
    }
  }
  return chunks;
};

module.exports = { indexChunks };
