const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const TourPackages = require("../models/TourPackages");
const User = require("../models/Users");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const Payment = require("../models/PaymentModel");
const { sendBookingUpdate } = require("../realtime/socket");

// Background task to cancel expired pending/cancelled bookings
exports.cancelExpiredBookings = async (req, res) => {
  try {
    const expiredBookings = await Booking.find({
      status: { $in: ["pending", "cancelled"] },
      createdAt: { $lte: new Date(Date.now() - 2 * 60 * 1000) },
    });

    if (expiredBookings.length === 0) {
      if (res) return res.status(200).json({ message: "No expired bookings found" });
      return;
    }

    await Promise.all(
      expiredBookings.map(async (booking) => {
        if (!booking.packageId) return;

        // Restore seats
        const updatedTour = await TourPackages.findByIdAndUpdate(
          booking.packageId,
          { $inc: { Seatleft: booking.numberOfTravelers } },
          { new: true }
        );

        if (updatedTour) {
          sendBookingUpdate({ Seatleft: updatedTour.Seatleft, packageId: updatedTour._id });
        }

        // Delete expired booking
        await Booking.deleteOne({ _id: booking._id });
      })
    );

    if (res) {
      return res.status(200).json({
        message: `Processed ${expiredBookings.length} expired bookings`,
      });
    }
  } catch (error) {
    console.error("Error canceling expired bookings:", error);
    if (res) {
      return res.status(500).json({ message: "Error canceling expired bookings", error: error.message });
    }
  }
};

// Create Stripe Checkout Session
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

    const tour = await TourPackages.findById(packageId);

    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    if (tour.Seatleft < Number(numberOfTravelers)) {
      return res.status(400).json({
        error: `Only ${tour.Seatleft} seats available`,
      });
    }

    // Clean price
    const cleanPrice = Number(String(tour.price).replace(/,/g, ""));
    const amountInPaise = Math.round(cleanPrice * 100);

    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (tour.currency === "₹" || tour.currency === "INR") ? "inr" : "usd",
            product_data: {
              name: tour.title,
              description: Array.isArray(tour.highlights) ? tour.highlights.join(", ") : tour.title,
            },
            unit_amount: amountInPaise,
          },
          quantity: Number(numberOfTravelers),
        },
      ],
      mode: "payment",
      success_url: `${clientUrl.replace(/\/+$/, "")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl.replace(/\/+$/, "")}/payment-cancel`,
      metadata: {
        userId: req.user ? req.user.id : "",
        packageId: tour._id.toString(),
        name,
        email,
        numberOfTravelers: String(numberOfTravelers),
        fromDate: String(fromDate),
        toDate: String(toDate),
        address,
        mobileNumber,
        pincode,
        specialRequests: specialRequests || "",
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get bookings (Admins get all, regular users get only their own)
exports.getBookings = async (req, res) => {
  try {
    const filter = req.user && req.user.role === "admin" ? {} : { userId: req.user?.id };
    const bookings = await Booking.find(filter).populate(
      "packageId",
      "title location price"
    );

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch bookings",
    });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
  }

  try {
    const filter = req.user && req.user.role === "admin"
      ? { _id: bookingId }
      : { _id: bookingId, userId: req.user?.id };

    const booking = await Booking.findOne(filter).populate(
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
    console.error("Error fetching booking by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch booking",
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID",
    });
  }

  try {
    const filter = req.user && req.user.role === "admin"
      ? { _id: bookingId }
      : { _id: bookingId, userId: req.user?.id };

    const updatedBooking = await Booking.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
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
    const filter = req.user && req.user.role === "admin"
      ? { _id: bookingId }
      : { _id: bookingId, userId: req.user?.id };

    const deletedBooking = await Booking.findOneAndDelete(filter);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
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

    const filter = req.user?.role === "admin"
      ? { _id: bookingId }
      : { _id: bookingId, userId };

    const booking = await Booking.findOne(filter);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled" || booking.status === "refunded")
      return res.status(400).json({ message: "Booking is already cancelled or refunded" });

    booking.status = "cancelled";
    await booking.save();

    // Restore seats
    const updatedTour = await TourPackages.findByIdAndUpdate(
      booking.packageId,
      { $inc: { Seatleft: Number(booking.numberOfTravelers) } },
      { new: true }
    );

    if (updatedTour) {
      sendBookingUpdate({ Seatleft: updatedTour.Seatleft, packageId: updatedTour._id });
    }

    // Refund if paymentIntentId exists
    if (booking.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
        booking.status = "refunded";
        await booking.save();
      } catch (refundErr) {
        console.error("Stripe refund error:", refundErr);
      }
    }

    return res.status(200).json({ message: "Booking cancelled and processed successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.cancelBooking = exports.CancleBooking;
