const { supabase } = require("../config/supabase");
const { generateEmbedding } = require("../services/localEmbedding");

const searchTours = async (query) => {
  // 1️⃣ Convert query → embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2️⃣ Call Supabase vector search
  const { data, error } = await supabase.rpc("match_tours", {
    query_embedding: queryEmbedding,
    match_count: 5,
  });

  if (error) {
    console.error("Search error:", error);
    throw error;
  }

  return data;
};

module.exports = { searchTours };
