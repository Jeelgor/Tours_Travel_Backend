const { generateEmbedding } = require("./localEmbedding");
const { supabase } = require("../config/supabase");
const { getTourData } = require("./Ai.services");
const { createTourChunks } = require("../Utility/Chunk");

const indexChunks = async () => {
  try {
    const tours = await getTourData();
    const chunks = tours.flatMap(createTourChunks);

    for (const chunk of chunks) {
      // ✅ Generate embedding locally
      const embedding = await generateEmbedding(chunk.text);

      // ✅ Insert into Supabase
      const { error } = await supabase.from("tour_embeddings").insert({
        tour_id: chunk.metadata.tourId,
        chunk_type: chunk.metadata.chunkType,
        tour_name: chunk.metadata.tourName,
        content: chunk.text,
        embedding,
      });

      if (error) {
        console.error("Insert error:", error);
      }
    }

    console.log("✅ All chunks indexed successfully");
  } catch (err) {
    console.error("Indexing failed:", err);
  }
};

module.exports = { indexChunks };
