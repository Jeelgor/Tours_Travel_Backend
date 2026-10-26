const { groupChunksByTour } = require("../Utility/groupContext");
const { buildContextString } = require("../Utility/buildContext");
const { generateGrokAnswer, generateGreetingAnswer } = require("./grokAnswer");
const { searchTours } = require("./searchTours");
const { isCasualOrGreeting } = require("../Utility/intentDetector");

const ragSearch = async (question, history = []) => {
  // 1️⃣ Check if it's casual greeting or small talk
  if (isCasualOrGreeting(question)) {
    const greeting = await generateGreetingAnswer(question, history);
    return {
      answer: greeting,
      recommendedTours: [],
      sources: [],
    };
  }

  // 2️⃣ Vector search on Supabase
  const result = await searchTours(question);
  const chunks = Array.isArray(result) ? result : result?.data || [];

  if (!chunks.length) {
    return {
      answer: "I couldn't find any tours matching that specific query. Try asking about destinations like **London** or **Malaysia**, or specify activities like adventure or family vacations!",
      recommendedTours: [],
      sources: [],
    };
  }

  // 3️⃣ Extract distinct tours for interactive action cards
  const tourMap = new Map();
  chunks.forEach((chunk) => {
    if (chunk.tour_id && !tourMap.has(chunk.tour_id)) {
      tourMap.set(chunk.tour_id, {
        tourId: chunk.tour_id,
        tourName: chunk.tour_name,
        snippet: chunk.content,
        similarity: chunk.similarity,
      });
    }
  });
  const recommendedTours = Array.from(tourMap.values()).slice(0, 3);

  // 4️⃣ Group & build context
  const grouped = groupChunksByTour(chunks);
  const context = buildContextString(grouped);

  // 5️⃣ Generate intelligent answer using Groq / fallback
  const answer = await generateGrokAnswer(question, context, history);

  return {
    answer,
    recommendedTours,
    sources: chunks,
  };
};

module.exports = { ragSearch };
