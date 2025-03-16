const Stripe = require("stripe");
const Booking = require("../models/Booking");
const PaymentModel = require("../models/PaymentModel");
const stripe = Stripe(process.env.STRIP_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { price } = req.body; // Price should be sent from the frontend

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100, // Stripe expects the price in the smallest currency unit (e.g., cents for USD)
      currency: "usd", // Change this to the currency you're using
    });

    res.send({
      clientSecret: paymentIntent.client_secret, // Send the clientSecret back to the frontend
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({ error: "Payment intent creation failed" });
  }
};

exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    console.log("🚀 Debug: Booking ID received for cancellation:", bookingId);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();

    // Check if a payment exists for this booking
    const payment = await PaymentModel.findOne({ bookingId });

    if (!payment) {
      return res
        .status(200)
        .json({ message: "Booking cancelled successfully. No payment found." });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
    });

    // Update payment status to refunded
    payment.status = "refunded";
    payment.refundId = refund.id; // Save refund ID
    await payment.save();

    res.status(200).json({
      message: "Booking cancelled and refund processed successfully",
      refund,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error during cancellation" });
  }
};
