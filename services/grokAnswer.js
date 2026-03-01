const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const generateGrokAnswer = async (question, context) => {
  try {
    if (!context?.length) {
      return "I couldn't find relevant tour information. Try refining your question.";
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an AI travel assistant for a tour booking platform. Use ONLY the provided tour information. If multiple tours match, recommend the best 1–2 options and explain why. Be concise and helpful. Also dont if tour is not specified by user then tell theme please provide valid tour interest.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion:\n${question}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { generateGrokAnswer };
