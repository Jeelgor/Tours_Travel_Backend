const express = require("express");
const router = express.Router();
const { handleTourRecommendation } = require("../Controller/AiController");

router.post("/recommend", handleTourRecommendation);

module.exports = router;
