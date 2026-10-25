const mongoose = require("mongoose");

const productDetailsSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  price: { type: String },
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("ProductDetails", productDetailsSchema);
