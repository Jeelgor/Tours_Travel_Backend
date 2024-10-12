const mongoose = require("mongoose");

const cloudeImageModelSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

module.exports = mongoose.model("CloudImages", cloudeImageModelSchema);
