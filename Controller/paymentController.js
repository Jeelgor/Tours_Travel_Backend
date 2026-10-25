const Stripe = require("stripe");
const Booking = require("../models/Booking");
const PaymentModel = require("../models/PaymentModel");
const stripe = Stripe(process.env.STRIP_SECRET_KEY || "sk_test_dummy");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { price } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(price) * 100),
      currency: "usd",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({ error: "Payment intent creation failed", message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    const filter = req.user?.role === "admin"
      ? { _id: bookingId }
      : { _id: bookingId, userId };

    const booking = await Booking.findOne(filter);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled" || booking.status === "refunded") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Cancel Stripe PaymentIntent if present
    if (booking.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
      } catch (stripeErr) {
        console.error("Stripe refund error:", stripeErr);
      }
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};
