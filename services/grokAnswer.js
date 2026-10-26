const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), override: true });

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Models tested and available on Groq (in priority order)
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const SYSTEM_PROMPT = `You are the AI Travel Concierge for "Tours & Travels", an elite tour booking platform.
Your mission is to provide inspiring, accurate, and personalized travel recommendations.

Guidelines:
1. Grounding: Rely strictly on the provided Tour Context. Never invent tours not found in the context.
2. Structure: Format your answers cleanly using Markdown:
   - Highlight tour names in **Bold** (e.g., **London Family Vacation**).
   - Use bullet points for key perks, activities, and amenities.
   - If multiple tours match, recommend the best 1–2 options and explain why.
3. Call to Action: Remind the user they can click the tour card below to view details and book directly.
4. Tone: Enthusiastic, warm, and helpful. Keep responses concise and focused (under 200 words).`;

const GREETING_SYSTEM_PROMPT = `You are the friendly AI Travel Concierge for "Tours & Travels".
Greet the traveler warmly, introduce yourself, and invite them to share where they'd like to go, their budget, or their travel style (e.g., beaches, adventure, family, culture).
Keep it short (2-3 sentences) and welcoming.`;

/**
 * Call Groq API with automatic model failover.
 */
const callGroqWithFallback = async (messages, maxTokens = 350) => {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_groq_api_key") {
    throw new Error("GROQ_API_KEY is not configured");
  }

  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages,
          temperature: 0.4,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 12000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
    } catch (err) {
      lastError = err;
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`Groq model ${model} failed: ${errMsg}`);
      // If error is 401 Unauthorized, key is invalid, break early
      if (err.response?.status === 401) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All Groq models failed");
};

/**
 * Call Google Gemini API as fallback.
 */
const callGemini = async (messages) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const promptText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: promptText }] }],
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
};

/**
 * Handle casual greeting conversation without vector search context.
 */
const generateGreetingAnswer = async (question, history = []) => {
  const formattedHistory = Array.isArray(history)
    ? history
        .filter((h) => h && h.content && (h.role === "user" || h.role === "assistant"))
        .slice(-4)
        .map((h) => ({ role: h.role, content: String(h.content) }))
    : [];

  const messages = [
    { role: "system", content: GREETING_SYSTEM_PROMPT },
    ...formattedHistory,
    { role: "user", content: question },
  ];

  try {
    return await callGroqWithFallback(messages, 150);
  } catch (err) {
    try {
      return await callGemini(messages);
    } catch (innerErr) {
      return "👋 Hello! I'm your **AI Travel Concierge** at Tours & Travels.\n\nI can help you find beach getaways, cultural expeditions, family vacations, and adventure trips. Tell me where you want to go or what kind of trip you have in mind!";
    }
  }
};

/**
 * Generate answer using RAG context with multi-turn history.
 */
const generateGrokAnswer = async (question, context, history = []) => {
  if (!context || !context.trim()) {
    return "I couldn't find any tours matching that specific request in our catalog. Try searching for destinations like **London**, **Malaysia**, or **Goa**, or ask for family or adventure packages!";
  }

  const formattedHistory = Array.isArray(history)
    ? history
        .filter((h) => h && h.content && (h.role === "user" || h.role === "assistant"))
        .slice(-4)
        .map((h) => ({ role: h.role, content: String(h.content) }))
    : [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...formattedHistory,
    {
      role: "user",
      content: `### Tour Catalog Context:\n${context}\n\n### Traveler Question:\n${question}`,
    },
  ];

  // 1️⃣ Try Groq
  try {
    const answer = await callGroqWithFallback(messages, 350);
    if (answer) return answer;
  } catch (err) {
    console.warn("Groq failed, attempting Gemini fallback:", err.message);
  }

  // 2️⃣ Try Gemini Fallback
  try {
    const geminiAnswer = await callGemini(messages);
    if (geminiAnswer) return geminiAnswer;
  } catch (err) {
    console.warn("Gemini fallback failed:", err.message);
  }

  // 3️⃣ Graceful catalog fallback
  return (
    `Here are the best matching tours from our catalog:\n\n` +
    context +
    `\n\n💡 *Tip: Click any tour card below to view itinerary and book!*`
  );
};

module.exports = {
  generateGrokAnswer,
  generateGreetingAnswer,
};
