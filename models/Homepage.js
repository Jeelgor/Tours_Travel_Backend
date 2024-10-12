const mongoose = require("mongoose");

const popularDestinationSchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  tourName: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
});

const popularDestination = mongoose.model(
  "popularDestination",
  popularDestinationSchema
);

module.exports = popularDestination;
