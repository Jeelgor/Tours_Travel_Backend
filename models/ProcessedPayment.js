const mongoose = require("mongoose");

const ProcessedPaymentSchema = new mongoose.Schema({
  paymentIntentId: {
    type: String,
    required: true,
    unique: true, // This is our lock
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ProcessedPayment", ProcessedPaymentSchema);
