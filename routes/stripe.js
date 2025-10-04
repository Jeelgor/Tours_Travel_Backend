const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const Booking = require("../models/Booking");
const TourPackages = require("../models/TourPackages"); // make sure this exists
const stripe = Stripe(process.env.STRIP_SECRET_KEY);

const router = express.Router();

/**
 * Handle Stripe webhook for checkout session completed
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body required
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Payment successful!", session);

    // Extract metadata
    const {
      userId,
      packageId,
      name,
      email,
      numberOfTravelers,
      fromDate,
      toDate,
      address,
      mobileNumber,
      pincode,
      specialRequests,
    } = session.metadata;

    try {
      // Atomically decrement seats
      const tour = await TourPackages.findOneAndUpdate(
        { _id: packageId, SeatLeft: { $gte: Number(numberOfTravelers) } },
        { $inc: { SeatLeft: -Number(numberOfTravelers) } },
        { new: true }
      );

      if (!tour) {
        console.log("Not enough seats available");
        return res.status(400).send("Not enough seats available");
      }

      // Create booking
      const booking = await Booking.create({
        userId,
        packageId,
        name,
        email,
        numberOfTravelers,
        fromDate,
        toDate,
        address,
        mobileNumber,
        pincode,
        specialRequests,
        status: "paid",
      });

      console.log("Booking saved stipejs:", booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).send("Server error");
    }
  }

  res.json({ received: true });
};

/**
 * Verify checkout session (frontend calls this after redirect)
 */
const verifyCheckoutSession = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId)
    return res.status(400).json({ message: "Session ID is required" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session)
      return res.status(404).json({ message: "Stripe session not found" });

    const existingBooking = await Booking.findOne({
      userId: session.metadata.userId,
      packageId: session.metadata.packageId,
      status: "paid",
    });

    if (existingBooking) {
      return res.json({
        message: "Booking already exists",
        booking: existingBooking,
      });
    }

    // Atomically decrement seats
    const tour = await TourPackages.findOneAndUpdate(
      {
        _id: session.metadata.packageId,
        SeatLeft: { $gte: Number(session.metadata.numberOfTravelers) },
      },
      { $inc: { SeatLeft: -Number(session.metadata.numberOfTravelers) } },
      { new: true }
    );

    if (!tour) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Create booking
    const booking = await Booking.create({
      userId: session.metadata.userId,
      packageId: session.metadata.packageId,
      name: session.metadata.name,
      email: session.metadata.email,
      numberOfTravelers: session.metadata.numberOfTravelers,
      fromDate: session.metadata.fromDate,
      toDate: session.metadata.toDate,
      address: session.metadata.address,
      mobileNumber: session.metadata.mobileNumber,
      pincode: session.metadata.pincode,
      specialRequests: session.metadata.specialRequests,
      status: "paid",
    });

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Error verifying session:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Routes
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);
router.post("/verify-checkout-session", verifyCheckoutSession);

module.exports = router;
