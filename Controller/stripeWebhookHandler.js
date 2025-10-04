const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = Stripe(process.env.STRIP_SECRET_KEY);

exports.stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

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
      specialRequests: session.metadata.specialRequests || "",
      status: "paid",
    };

    try {
      await Booking.create(bookingData);
      console.log("Booking saved:", bookingData);
    } catch (err) {
      console.error("Error saving booking:", err);
    }
  }

  res.json({ received: true });
};
