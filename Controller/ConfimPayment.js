const express = require("express");
const Payment = require("../models/PaymentModel"); // Assuming you have a Payment model
const User = require("../models/Users"); // Assuming you have a User model

// POST request to save payment details
exports.savePayment = async (req, res) => {
  const {
    userId,
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
      paymentIntentId,
      amount,
      packageName,
      status,
      paymentMethod,
      paymentDate: new Date(),
    });

    // Save the payment to the database
    await newPayment.save();

    // Optionally, update user or booking status
    // Example: Update user's booking status or add payment reference to user

    res
      .status(200)
      .json({ message: "Payment saved successfully", payment: newPayment });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
