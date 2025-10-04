const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const TourPackages = require("../models/TourPackages");
const User = require("../models/Users");
const { Tourpackages } = require("../models/TourPackages");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const { getIo } = require("../socket/socket");
const Payment = require("../models/PaymentModel");
const { sendBookingUpdate } = require("../realtime/socket");

// Controller to handle booking creation
// exports.createBooking = async (req, res) => {
//   try {
//     const {
//       _id,
//       packageId,
//       name,
//       email,
//       numberOfTravelers,
//       specialRequests,
//       fromDate,
//       toDate,
//       address,
//       mobileNumber,
//       pincode,
//     } = req.body;

//     // Get userId from authenticated user
//     const userId = req.user?.id; // Ensure user exists before accessing id

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User authentication required",
//       });
//     }

//     // Validate user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Validate tour package
//     const tour = await TourPackages.findById(packageId);
//     if (!tour) {
//       return res.status(404).json({
//         success: false,
//         message: "Tour not found",
//       });
//     }

//     // Create booking
//     const newBooking = new Booking({
//       userId,
//       packageId,
//       name,
//       email,
//       numberOfTravelers,
//       specialRequests,
//       fromDate,
//       toDate,
//       address,
//       mobileNumber,
//       pincode,
//       status: "pending",
//     });

//     await newBooking.save();

//     tour.Seatleft -= numberOfTravelers;
//     await tour.save();
//     sendBookingUpdate({ Seatleft: tour.Seatleft, packageId: tour._id });

//     res.status(201).json({
//       success: true,
//       message: "Booking initiated. Proceed with payment.",
//       bookingId: newBooking._id,
//       Seatleft: tour.Seatleft,
//     });
//   } catch (error) {
//     console.error("Error creating booking:", error);

//     if (!res.headersSent) {
//       // Prevent multiple responses
//       return res.status(500).json({
//         success: false,
//         message: "Server error, unable to create booking",
//         error: error.message,
//       });
//     }
//   }
// };

exports.cancelExpiredBookings = async () => {
  const now = new Date();

  try {
    const expiredBookings = await Booking.find({
      status: { $in: ["pending", "cancelled"] },
      createdAt: { $lte: new Date(Date.now() - 2 * 60 * 1000) },
    });

    if (expiredBookings.length === 0) {
      console.log("No expired bookings found.");
      return;
    }
    console.log("Expired Bookings:", expiredBookings.length);
    console.log(
      "Expired Booking IDs:",
      expiredBookings.map((b) => b.packageId)
    );

    await Promise.all(
      expiredBookings.map(async (booking) => {
        console.log("Processing Booking:", booking);

        if (!booking.packageId) {
          console.log(
            `⛔ ERROR: packageId is missing for booking ${booking.packageId}`
          );
          return;
        }

        // ✅ Fetch the tour package using the correct packageId
        const tour = await TourPackages.findById(booking.packageId);

        if (!tour) {
          console.log(
            `⛔ ERROR: Tour package not found for packageId ${booking.packageId}`
          );
          return;
        }

        console.log("Before restoration, Tour Seats:", tour.Seatleft);
        tour.Seatleft += booking.numberOfTravelers;
        await tour.save();
        console.log("After restoration, Tour Seats:", tour.Seatleft);

        // getIo().emit("updateSeats", {
        //   _id: booking.packageId,
        //   Seatleft: tour.Seatleft,
        // });

        // ✅ Delete the booking properly
        await Booking.deleteOne({ packageId: booking.packageId });

        console.log(`✅ Booking ${booking._id} canceled and seats restored.`);
      })
    );

    console.log("✅ All expired bookings processed successfully.");
  } catch (error) {
    console.error("Error canceling expired bookings:", error);
  }
};

// confirm-booking
exports.createCheckoutSession = async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Fetch the tour from DB
    const tour = await TourPackages.findById(packageId);
    if (!tour) return res.status(404).json({ error: "Tour not found" });

    // Clean price: remove commas and convert to paise
    const cleanPrice = Number(tour.price.replace(/,/g, ""));
    const amountInPaise = cleanPrice * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: tour.title,
              description: tour.highlights.join(", "),
            },
            unit_amount: amountInPaise,
          },
          quantity: Number(numberOfTravelers),
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-cancel`,
      metadata: {
        userId: req.user.id,
        packageId: tour._id.toString(),
        name,
        email,
        numberOfTravelers,
        fromDate,
        toDate,
        address,
        mobileNumber,
        pincode,
        specialRequests: specialRequests || "",
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate(
      "packageId",
      "title location price"
    ); // Populate package details

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch bookings",
    });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
  }

  try {
    const booking = await Booking.findById(bookingId).populate(
      "packageId",
      "title location price"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch booking",
    });
  }
};

// Update booking details (e.g., after payment)
exports.updateBooking = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
  }

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      req.body,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to update booking",
    });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
  }

  try {
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to delete booking",
    });
  }
};

// Cancel a booking with refund
exports.CancleBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Booking is already cancelled" });

    // ✅ Update status
    booking.status = "cancelled";
    await booking.save();

    // ✅ Restore seats
    await TourPackages.findByIdAndUpdate(
      booking.packageId,
      { $inc: { Seatleft: Number(booking.numberOfTravelers) } },
      { new: true }
    );

    // ✅ Refund using saved paymentIntentId
    if (!booking.paymentIntentId)
      return res.status(400).json({ message: "No paymentIntentId found" });

    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });
    booking.status = "refunded";

    console.log(
      `✅ Booking ${bookingId} cancelled. Restored ${booking.numberOfTravelers} seats.`
    );

    return res
      .status(200)
      .json({ message: "Booking cancelled and refunded successfully" });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
