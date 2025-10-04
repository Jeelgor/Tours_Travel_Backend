const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const Booking = require("../models/Booking");
const stripe = Stripe(process.env.STRIP_SECRET_KEY);

const router = express.Router();

// Stripe requires raw body
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // <--- raw body required
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Payment successful!", session);

      // Save booking to DB here
      const Booking = require("../models/Booking");
      const bookingData = {
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
      };

      await Booking.create(bookingData);
    }

    res.json({ received: true });
  }
);

module.exports = router;
