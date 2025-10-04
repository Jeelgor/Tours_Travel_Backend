const axios = require("axios");

async function generateTourRecommendation(userPrompt) {
  const greetingsRegex = /\b(hi|hello|hey|yo|good morning|good evening)\b/;
  const nameRegex = /\b(what is your name)\b/;
  const howAreYouRegex = /\b(how are you)\b/;
  const thanksRegex = /\b(thank you|thanks)\b/;
  const byeRegex = /\b(bye|goodbye|see you)\b/;

  if (nameRegex.test(promptLower)) {
    return "🤖 I am LLaMA AI, your friendly travel assistant built by Jeel Gor to help you explore the world with ease.";
  } else if (greetingsRegex.test(promptLower)) {
    return "👋 Hello! Hope you're having a fantastic day! 🌞\n\nAre you planning your next adventure? Let me know your budget, preferred destination, or what kind of trip you’re looking for, and I’ll suggest the best packages for you!";
  } else if (howAreYouRegex.test(promptLower)) {
    return "I'm doing great and ready to help you plan your trip! ✈️🌴 How can I assist you today?";
  } else if (thanksRegex.test(promptLower)) {
    return "You're most welcome! 🙌 Let me know whenever you're ready to book your next adventure.";
  } else if (byeRegex.test(promptLower)) {
    return "👋 Goodbye! Have a wonderful day, and ping me anytime you want to plan your travels!";
  }

  const tourPackages = [
    {
      name: "Malaysia Beach Getaway",
      price: 45000,
      type: "beach",
      description:
        "A relaxing beach vacation with island hopping and snorkeling in Malaysia.",
    },
    {
      name: "Himachal Adventure Trip",
      price: 30000,
      type: "adventure",
      description: "Snow trekking, paragliding, and Himalayan experiences.",
    },
    {
      name: "Goa Chill Week",
      price: 20000,
      type: "beach",
      description: "7-day stay in Goa with beach parties and local tours.",
    },
  ];

  const budgetMatch = userPrompt.match(/(\d{4,6})/);
  const budget = budgetMatch ? parseInt(budgetMatch[0]) : null;

  let matchingPackages = tourPackages;
  if (budget) {
    matchingPackages = tourPackages.filter((pkg) => pkg.price <= budget);
  }

  if (matchingPackages.length === 0) {
    return "⚠️ Sorry, I couldn't find any packages under your budget. Please try with a higher budget or mention your preferred destination.";
  }

  const recommendedPackage = matchingPackages[0];

  console.log("🪵 User Prompt:", userPrompt);
  console.log("🪵 Budget Extracted:", budget);
  console.log("🪵 Recommended Package:", recommendedPackage.name);

  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama2",
      messages: [
        {
          role: "system",
          content:
            "You are a travel assistant. Create a 1-line catchy, warm, and engaging marketing sentence for this tour package.",
        },
        {
          role: "user",
          content: `Package: ${recommendedPackage.name}\nDescription: ${recommendedPackage.description}`,
        },
      ],
      stream: false,
    });

    console.log("Ollama response:", JSON.stringify(response.data, null, 2));

    let aiSummary = "";
    if (response.data) {
      const lines = response.data
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const parsed = JSON.parse(line);
        if (parsed.message && parsed.message.content) {
          aiSummary += parsed.message.content;
        }
      }
    }
    aiSummary = aiSummary.trim();

    return (
      `✅ Recommended Package:\n` +
      `📍 *${recommendedPackage.name}*\n` +
      `💰 Price: ₹${recommendedPackage.price}\n` +
      `📝 ${recommendedPackage.description}\n\n` +
      `💡 ${aiSummary}`
    );
  } catch (error) {
    console.error("Local AI error:", error);
    return (
      `✅ Recommended Package:\n` +
      `📍 *${recommendedPackage.name}*\n` +
      `💰 Price: ₹${recommendedPackage.price}\n` +
      `📝 ${recommendedPackage.description}\n\n` +
      `⚠️ AI summary unavailable, but let me know if you want to book or need more options!`
    );
  }
}

module.exports = { generateTourRecommendation };
