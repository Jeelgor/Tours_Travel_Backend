const mongoose = require("mongoose");

const tourPackageDetailsSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  gallery: {
    type: [String],
    required: true,
    default: [],
  },
  overview: {
    type: [mongoose.Schema.Types.Mixed],
    validate: {
      validator: function (arr) {
        return arr.length === 3;
      },
      message: "Overview must contain exactly 3 elements",
    },
  },
  amenities: {
    type: [String],
    default: [],
  },
  aboutProperty: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    perks: {
      type: [String],
      default: [],
    },
  },
  accessibility: {
    type: String,
    default: "",
  },
  commonAreas: {
    type: [String],
    default: [],
  },
  packageType: {
    type: String,
    enum: [
      "Adventure",
      "Romantic",
      "Family Specials",
      "Luxury",
      "Budget",
      "Group Tour",
      "Cruise Packages",
    ],
    required: true,
  },
});

module.exports = mongoose.model("TourPackageDetail", tourPackageDetailsSchema);
