const { getTourData } = require("../services/Ai.services");
const { createTourChunks } = require("../Utility/Chunk");
const { ragSearch } = require("../services/ragTours");

const fetchTourData = async (req, res) => {
  try {
    const tourData = await getTourData();
    const allchunks = tourData.flatMap(createTourChunks);
    res.status(200).json({ resource: allchunks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting TourData", error });
  }
};

const askTourAI = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const result = await ragSearch(query);

    res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("AI Ask Error:", error);
    res.status(500).json({ message: "AI request failed" });
  }
};

module.exports = { fetchTourData, askTourAI };
