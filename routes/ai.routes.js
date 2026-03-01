const express = require("express");
const router = express.Router();
const { fetchTourData, askTourAI } = require("../Controller/AiController");
const { runIndexing } = require("../Controller/aiIndex.controller");
const { semanticSearch } = require("../Controller/semanticSearch");

router.get("/fetchTourData", fetchTourData); // learning not in used
router.post("/index", runIndexing); // learning not in used
router.post("/search", semanticSearch); // learning not in used

router.post("/ask", askTourAI); // main funtion

module.exports = router;
