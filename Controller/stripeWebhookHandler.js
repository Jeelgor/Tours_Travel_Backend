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
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const travelers = Number(session.metadata.numberOfTravelers);

      // 1️⃣ Check if the same booking already exists (Idempotency check)
      // This prevents duplicate bookings if the webhook is retried
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

      // 2️⃣ Prevent overbooking with an ATOMIC database operation
      // OLD APPROACH (Race Condition): 
      // 1. tour = await TourPackages.findById(...)
      // 2. if (tour.Seatleft < travelers) return error
      // 3. tour.Seatleft -= travelers; await tour.save()
      // This allowed two concurrent requests to both see enough seats before either updated the DB.

      // NEW APPROACH (Atomic):
      // We use findOneAndUpdate with a filter that includes the seat check.
      // This ensures that the check and decrement happen as a single, indivisible operation in MongoDB.
      const updatedTour = await TourPackages.findOneAndUpdate(
        {
          _id: session.metadata.packageId,
          Seatleft: { $gte: travelers } // Condition: Only if enough seats are available
        },
        { 
          $inc: { Seatleft: -travelers } // Action: Decrement seats atomically
        },
        { new: true } // Return the updated document
      );

      if (!updatedTour) {
        // If updatedTour is null, it means either the tour doesn't exist 
        // OR (more likely) Seatleft is now less than requested travelers.
        console.log("❌ Not enough seats left or tour not found during atomic update");
        return res.status(400).send("Not enough seats available or tour not found");
      }

      console.log(`✅ Seats updated atomically. Seats left: ${updatedTour.Seatleft}`);

      // 3️⃣ Create Booking
      // We only reach this point if the seat deduction was successful.
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

      // 4️⃣ Save Payment record
      const paymentData = {
        userId: session.metadata.userId,
        userEmail: session.metadata.email,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
        packageName: updatedTour.title,
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
