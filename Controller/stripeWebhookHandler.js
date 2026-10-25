const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIP_SECRET_KEY || "sk_test_dummy");
const Booking = require("../models/Booking");
const TourPackages = require("../models/TourPackages");
const Payment = require("../models/PaymentModel");

// Webhook handler
exports.stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  const rawBody = req.rawBody || req.body;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const travelers = Number(session.metadata?.numberOfTravelers || 1);

      const existingBooking = await Booking.findOne({
        paymentIntentId: session.payment_intent,
      });

      if (existingBooking) {
        console.log(
          `⚠️ Booking already exists for paymentIntentId ${session.payment_intent}`
        );
        return res.status(200).json({
          message: "Booking already exists",
          booking: existingBooking,
        });
      }

      const updatedTour = await TourPackages.findOneAndUpdate(
        {
          _id: session.metadata.packageId,
          Seatleft: { $gte: travelers },
        },
        { 
          $inc: { Seatleft: -travelers } 
        },
        { new: true }
      );

      if (!updatedTour) {
        console.log("❌ Not enough seats left or tour not found during atomic update");
        return res.status(400).send("Not enough seats available or tour not found");
      }

      console.log(`✅ Seats updated atomically. Seats left: ${updatedTour.Seatleft}`);

      const bookingData = {
        userId: session.metadata.userId,
        packageId: session.metadata.packageId,
        name: session.metadata.name,
        email: session.metadata.email,
        numberOfTravelers: travelers,
        fromDate: session.metadata.fromDate,
        toDate: session.metadata.toDate,
        address: session.metadata.address,
        mobileNumber: session.metadata.mobileNumber,
        pincode: session.metadata.pincode,
        specialRequests: session.metadata.specialRequests || "",
        paymentIntentId: session.payment_intent,
        status: "paid",
      };

      const newBooking = await Booking.create(bookingData);
      console.log(`✅ Booking saved: ${newBooking._id}`);

      const paymentData = {
        userId: session.metadata.userId,
        userEmail: session.metadata.email,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
        packageName: updatedTour.title,
        status: "succeeded",
        paymentMethod: session.payment_method_types?.[0] || "card",
        bookingId: newBooking._id,
        paymentDate: new Date(),
      };

      await Payment.create(paymentData);
      console.log("✅ Payment record saved successfully");
    } catch (err) {
      console.error("❌ Error saving booking or updating seats:", err);
      return res.status(500).send("Server error");
    }
  }

  res.json({ received: true });
};
