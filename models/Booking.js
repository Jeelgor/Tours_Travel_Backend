const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  numberOfTravelers: { type: Number, required: true },
  specialRequests: { type: String },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  packageId: {
    type: String,
    required: true,
  },
  address: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  }
});

module.exports = mongoose.model("Booking", BookingSchema);
