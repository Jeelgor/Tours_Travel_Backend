const express = require("express");
const Payment = require("../models/PaymentModel"); // Assuming you have a Payment model
const User = require("../models/Users"); // Assuming you have a User model

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
  } = req.body;

  try {
    // Fetch user details if needed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new payment document
    const newPayment = new Payment({
      userId,
      userEmail,
      paymentIntentId,
      amount,
      packageName,
      status,
      paymentMethod,
      paymentDate: new Date(),
    });

    // Save the payment to the database
    await newPayment.save();
    res
      .status(200)
      .json({ message: "Payment saved successfully", payment: newPayment });
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
