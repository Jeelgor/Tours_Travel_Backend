const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const Booking = require("../models/Booking");
const TourPackages = require("../models/TourPackages");
const ProcessedPayment = require("../models/ProcessedPayment");
const Payment = require("../models/PaymentModel"); // To record payment status
const { sendBookingUpdate } = require("../realtime/socket");
const stripe = Stripe(process.env.STRIP_SECRET_KEY);

const router = express.Router();

/**
 * Unified function to handle seat deduction and booking creation.
 * Uses ProcessedPayment as an atomic lock to ensure it only runs ONCE per payment.
 */
async function processBooking(session) {
  const paymentIntentId = session.payment_intent;
  if (!paymentIntentId) return null;

  try {
    // 1. Attempt to claim this payment atomically
    await ProcessedPayment.create({ paymentIntentId });
    console.log(`🔐 Payment claimed for processing: ${paymentIntentId}`);

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

    const travelers = Number(numberOfTravelers);

    // 2. Atomically decrement seats
    const tour = await TourPackages.findOneAndUpdate(
      { 
        _id: packageId, 
        Seatleft: { $gte: travelers } 
      },
      { 
        $inc: { Seatleft: -travelers } 
      },
      { new: true }
    );

    // 3. Handle NO SEATS scenario (Refund required)
    if (!tour) {
      console.error(`❌ FAILED: Not enough seats for tour ${packageId}. Initiating REFUND for ${paymentIntentId}`);
      
      // Record failed payment attempt
      await Payment.create({
        userId,
        userEmail: email,
        paymentIntentId,
        amount: session.amount_total,
        packageName: "REFUNDED: " + (session.metadata.packageName || "Tour"),
        status: "refund_initiated",
        paymentMethod: session.payment_method_types[0],
        paymentDate: new Date(),
      });

      // INITIATE AUTOMATIC REFUND
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: "requested_by_customer", // Best fit for automated out-of-stock
      });

      throw new Error("NOT_ENOUGH_SEATS");
    }

    // 4. Broadcast seat update
    sendBookingUpdate({ Seatleft: tour.Seatleft, packageId: tour._id });

    // 5. Create the booking
    const booking = await Booking.create({
      userId,
      packageId,
      name,
      email,
      numberOfTravelers: travelers,
      fromDate,
      toDate,
      address,
      mobileNumber,
      pincode,
      specialRequests,
      paymentIntentId,
      status: "paid",
    });

    // 6. Record successful payment
    await Payment.create({
      userId,
      userEmail: email,
      paymentIntentId,
      amount: session.amount_total,
      packageName: tour.title,
      status: "succeeded",
      paymentMethod: session.payment_method_types[0],
      bookingId: booking._id,
      paymentDate: new Date(),
    });

    console.log(`✅ Processed booking and payment successfully: ${booking._id}`);
    return booking;
  } catch (error) {
    if (error.code === 11000) {
      console.log(`ℹ️ Payment ${paymentIntentId} already processed, skipping.`);
      return await Booking.findOne({ paymentIntentId });
    }
    console.error(`❌ Error in processBooking for ${paymentIntentId}:`, error);
    throw error;
  }
}

/**
 * Handle Stripe webhook for checkout session completed
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      await processBooking(session);
    } catch (err) {
      // Even if it fails (e.g. no seats), we've handled the refund in processBooking.
      // We return 200 to Stripe because we have "processed" the event.
      console.log("Webhook processed with internal error (likely refund triggered)");
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

    // Wait a brief moment to let the webhook finish if it's already running
    await new Promise(resolve => setTimeout(resolve, 1000));

    const booking = await processBooking(session);

    if (!booking) {
      return res.status(400).json({ message: "Booking could not be processed" });
    }

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Error verifying session:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message === "NOT_ENOUGH_SEATS" ? "NOT_ENOUGH_SEATS" : err.message 
    });
  }
};

/**
 * Handle Stripe session cancellation (restore seats)
 */
const cancelCheckoutSession = async (req, res) => {
  const { packageId, numberOfTravelers } = req.body;
  
  if (!packageId || !numberOfTravelers) {
    return res.status(400).json({ message: "Package ID and number of travelers are required" });
  }

  try {
    // Only restore if the user manually cancelled before paying
    const updatedTour = await TourPackages.findByIdAndUpdate(
      packageId,
      { $inc: { Seatleft: Number(numberOfTravelers) } },
      { new: true }
    );
    
    sendBookingUpdate({ Seatleft: updatedTour.Seatleft, packageId: updatedTour._id });
    res.json({ message: "Seats restored successfully" });
  } catch (err) {
    console.error("Error restoring seats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Routes
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);
router.post("/verify-checkout-session", verifyCheckoutSession);
router.post("/cancel-session", cancelCheckoutSession);

module.exports = router;
