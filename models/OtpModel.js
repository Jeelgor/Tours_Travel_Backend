const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const otp = mongoose.model("OTP", otpSchema);
module.exports = otp;
