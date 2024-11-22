const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming the payment is related to a user
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  packageName: {
    type: String,
    required: true,
  },
  status: {
    type: String, // Payment status (e.g., "succeeded", "failed")
    required: true,
  },
  paymentMethod: {
    type: String, // Payment method (e.g., "card")
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
