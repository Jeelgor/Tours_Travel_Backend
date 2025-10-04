const { generateTourRecommendation } = require("../services/openai.service");

const handleTourRecommendation = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const aiResponse = await generateTourRecommendation(userPrompt);
    console.log(aiResponse, 999);
    res.status(200).json({ message: aiResponse });
  } catch (error) {
    res.status(500).json({ message: "Error generating recommendation", error });
  }
};

module.exports = { handleTourRecommendation };
