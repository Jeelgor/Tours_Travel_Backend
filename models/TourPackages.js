const mongoose = require("mongoose");

const TourpackagesSchema = new mongoose.Schema({
  TourName: {
    type: String,
    required: true,
  },
  TourPrice: {
    type: Number,
    required: true,
  },
  keyPoints1: {
    type: String,
    required: true,
  },
  keyPoints2: {
    type: String,
    required: true,
  },
  keyPoints3: {
    type: String,
    required: true,
  },
  keyPoints4: {
    type: String,
    required: true,
  },
  keyPoints5: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Tourpackages", TourpackagesSchema);
