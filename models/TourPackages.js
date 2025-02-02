const mongoose = require("mongoose");

const TourpackagesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  imageurl: {
    type: String,
    required: true,
  },

  highlights: {
    type: [String],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  Seatleft: {
    type: Number,
    required: true,
    min:0
  },
});

// Export the model
module.exports = mongoose.model("Tourpackages", TourpackagesSchema);
