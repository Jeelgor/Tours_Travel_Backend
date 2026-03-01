const { groupChunksByTour } = require("../Utility/groupContext");
const { buildContextString } = require("../Utility/buildContext");
const { generateGrokAnswer } = require("./grokAnswer");
const { searchTours } = require("./searchTours"); // 👈 your vector search

const ragSearch = async (question) => {
  // 1️⃣ get similar chunks from vector DB
  const result = await searchTours(question);

  const chunks = result.data || result; // handle supabase response

  // 2️⃣ group
  const grouped = groupChunksByTour(chunks);

  // 3️⃣ build context
  const context = buildContextString(grouped);

  // 4️⃣ ask LLM
  const answer = await generateGrokAnswer(question, context);

  return { answer, sources: chunks };
};

module.exports = { ragSearch };
