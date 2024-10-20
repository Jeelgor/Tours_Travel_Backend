const mongoose = require("mongoose");

const TourpackagesSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true, // Ensure _id is required if needed
  },
  title: {
    type: String,
    required: true, // Ensure title is required
  },
  location: {
    type: String,
    required: true, // Ensure location is required
  },
  imageurl: {
    type: String,
    required: true, // Ensure imageurl is required
  },

  highlights: {
    type: [String],
    required: true, // Ensure highlights is required
  },
  rating: {
    type: Number,
    required: true, // Ensure rating is required
  },
  price: {
    type: String,
    required: true, // Ensure price is required
  },
  currency: {
    type: String,
    required: true, // Ensure currency is required
  },
});

// Export the model
module.exports = mongoose.model("Tourpackages", TourpackagesSchema);
