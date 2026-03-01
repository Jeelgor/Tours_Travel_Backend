const express = require("express");
const router = express.Router();
const { fetchTourData, askTourAI } = require("../Controller/AiController");
const { runIndexing } = require("../Controller/aiIndex.controller");
const { semanticSearch } = require("../Controller/semanticSearch");

router.get("/fetchTourData", fetchTourData);
router.post("/index", runIndexing);
router.post("/search", semanticSearch);

router.post("/ask", askTourAI);

module.exports = router;
