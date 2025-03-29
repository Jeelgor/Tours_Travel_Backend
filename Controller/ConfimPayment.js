const express = require("express");
const Payment = require("../models/PaymentModel"); // Assuming you have a Payment model
const User = require("../models/Users"); // Assuming you have a User model
const Booking = require("../models/Booking");
const { sendBookingConfirmation } = require("../Utility/emailService");

// POST request to save payment details
exports.savePayment = async (req, res) => {
  const {
    userId,
    userEmail,
    paymentIntentId,
    amount,
    packageName,
    status,
    paymentMethod,
    bookingId,
  } = req.body;

  try {
    // ✅ 1. Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ 2. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 3. Save payment
    const newPayment = new Payment({
      userId,
      userEmail,
      paymentIntentId,
      amount,
      packageName,
      status,
      paymentMethod,
      paymentDate: new Date(),
      bookingId,
    });

    await newPayment.save();

    booking.status = "confirmed";
    await booking.save();
    // Send confirmation email
    await sendBookingConfirmation(userEmail, {
      _id: booking._id,
      name: booking.name,
      email: userEmail,
      packageId: booking.packageId,
      fromDate: booking.fromDate,
      toDate: booking.toDate,
      status: booking.status,
    });

    res.status(200).json({
      message: "Payment saved successfully, Booking Confirmed!",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const Payments = await Payment.find();

    return res.status(200).json({
      success: true,
      data: Payments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch bookings",
    });
  }
};
