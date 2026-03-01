const { generateEmbedding } = require("../services/localEmbedding");

const indexChunks = async () => {
  const chunks = await getChunksSomehow();

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);
    console.log(embedding);
  }
};
