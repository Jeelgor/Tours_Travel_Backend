const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIP_SECRET_KEY);
const Booking = require("../models/Booking");
const TourPackages = require("../models/TourPackages");
const Payment = require("../models/PaymentModel");

// Webhook handler
exports.stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body required
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // 1️⃣ Fetch the tour package
      const tour = await TourPackages.findById(session.metadata.packageId);
      if (!tour) throw new Error("Tour package not found");

      const travelers = Number(session.metadata.numberOfTravelers);

      // 2️⃣ Prevent overbooking
      if (tour.Seatleft < travelers) {
        console.log("❌ Not enough seats left for booking");
        return res.status(400).send("Not enough seats available");
      }

      // 3️⃣ Check if the same booking already exists
      const existingBooking = await Booking.findOne({
        userId: session.metadata.userId,
        packageId: session.metadata.packageId,
        fromDate: session.metadata.fromDate,
        toDate: session.metadata.toDate,
        status: "paid",
      });

      if (existingBooking) {
        console.log(
          `⚠️ Booking already exists for user ${session.metadata.userId}`
        );
        return res
          .status(200)
          .json({
            message: "Booking already exists",
            booking: existingBooking,
          });
      }

      // 4️⃣ Create Booking
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

      // 5️⃣ Update Seats
      const updatedTour = await TourPackages.findByIdAndUpdate(
        session.metadata.packageId,
        { $inc: { Seatleft: -travelers } },
        { new: true }
      );
      console.log(`✅ Seats updated. Seats left: ${updatedTour.Seatleft}`);

      // 6️⃣ Save Payment record
      const paymentData = {
        userId: session.metadata.userId,
        userEmail: session.metadata.email,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
        packageName: tour.title,
        status: "succeeded",
        paymentMethod: session.payment_method_types[0],
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

  // Return a 200 to acknowledge receipt of the event
  res.json({ received: true });
};
