const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  numberOfTravelers: { type: Number, required: true },
  specialRequests: { type: String },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  packageId: {
    type: String, // Use String instead of ObjectId
    required: true,
    // Optionally, you can add a custom validator to check the format of packageId
    // match: /^[a-zA-Z0-9]{3,}$/, // Example regex for validation
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
