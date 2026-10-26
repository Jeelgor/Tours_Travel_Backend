const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Call Groq API with primary (llama-3.3-70b-versatile) or fallback (llama-3.1-8b-instant) model.
 */
const callGroq = async (question, context, model = "llama-3.3-70b-versatile") => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key") {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await axios.post(
    GROQ_API_URL,
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an AI travel assistant for a tour booking platform. Use ONLY the provided tour information. If multiple tours match, recommend the best 1–2 options and explain why. Be concise, friendly, and helpful. If no specific tour matches the user query, politely ask them for their preferred destination or budget.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 350,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data?.choices?.[0]?.message?.content;
};

/**
 * Call Google Gemini API as a secondary fallback.
 */
const callGemini = async (question, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              text: `You are an AI travel assistant for a tour booking platform. Use ONLY the provided tour information. If multiple tours match, recommend the best 1–2 options and explain why. Be concise and friendly.\n\nContext:\n${context}\n\nUser Question:\n${question}`,
            },
          ],
        },
      ],
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
};

const generateGrokAnswer = async (question, context) => {
  if (!context || !context.trim()) {
    return "I couldn't find any tours matching that description. Try asking about destinations like Goa, Himachal, Kerala, or Malaysia!";
  }

  // 1️⃣ Try Groq with llama-3.3-70b-versatile
  try {
    const answer = await callGroq(question, context, "llama-3.3-70b-versatile");
    if (answer) return answer;
  } catch (err) {
    console.warn("Groq llama-3.3-70b-versatile failed, trying llama-3.1-8b-instant:", err.response?.data?.error?.message || err.message);
    try {
      const answer = await callGroq(question, context, "llama-3.1-8b-instant");
      if (answer) return answer;
    } catch (innerErr) {
      console.warn("Groq llama-3.1-8b-instant failed:", innerErr.response?.data?.error?.message || innerErr.message);
    }
  }

  // 2️⃣ Try Gemini Fallback
  try {
    const geminiAnswer = await callGemini(question, context);
    if (geminiAnswer) return geminiAnswer;
  } catch (err) {
    console.warn("Gemini fallback failed:", err.response?.data?.error?.message || err.message);
  }

  // 3️⃣ Graceful catalog fallback if all LLM keys are expired/missing (prevents app crash)
  return (
    `Here are the best matching tours from our catalog:\n\n` +
    context +
    `\n\nYou can book any of these directly on our Tour Packages page!`
  );
};

module.exports = { generateGrokAnswer };
