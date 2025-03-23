const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const TourPackages = require("../models/TourPackages");
const User = require("../models/Users");
const { Tourpackages } = require("../models/TourPackages");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const { getIo } = require("../socket/socket");
const Payment = require("../models/PaymentModel");

// Controller to handle booking creation
exports.createBooking = async (req, res) => {
  try {
    const {
      _id,
      packageId,
      name,
      email,
      numberOfTravelers,
      specialRequests,
      fromDate,
      toDate,
      address,
      mobileNumber,
      pincode,
    } = req.body;

    // Get userId from authenticated user
    const userId = req.user?.id; // Ensure user exists before accessing id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate tour package
    const tour = await TourPackages.findById(packageId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Create booking
    const newBooking = new Booking({
      userId,
      packageId,
      name,
      email,
      numberOfTravelers,
      specialRequests,
      fromDate,
      toDate,
      address,
      mobileNumber,
      pincode,
      status: "pending",
    });

    await newBooking.save();

    tour.Seatleft -= numberOfTravelers;
    await tour.save();

    getIo().emit("updateSeats", { _id, Seatleft: tour.Seatleft });

    res.status(201).json({
      success: true,
      message: "Booking initiated. Proceed with payment.",
      bookingId: newBooking._id,
      Seatleft: tour.Seatleft,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    if (!res.headersSent) {
      // Prevent multiple responses
      return res.status(500).json({
        success: false,
        message: "Server error, unable to create booking",
        error: error.message,
      });
    }
  }
};

const cancelExpiredBookings = async () => {
  const now = new Date();

  try {
    const expiredBookings = await Booking.find({
      status: "pending",
      createdAt: { $lte: new Date(Date.now() - 10 * 60 * 1000) },
    });

    if (expiredBookings.length === 0) {
      console.log("No expired bookings found.");
      return;
    }

    console.log("Expired Bookings:", expiredBookings.length);

    for (const booking of expiredBookings) {
      const tour = await TourPackages.findById(booking.tourId);

      if (tour) {
        console.log("Booking data:", booking);
        console.log("Before restoration, Tour Seats:", tour.Seatleft);

        tour.Seatleft += booking.numberOfTravelers;
        await tour.save();

        console.log("After restoration, Tour Seats:", tour.Seatleft);
      }

      booking.status = "cancelled";
      await booking.deleteOne();

      getIo().emit("updateSeats", {
        _id: booking._id,
        Seatleft: tour ? tour.Seatleft : "Unknown",
      });
    }

    console.log("Expired bookings canceled and seats restored.");
  } catch (error) {
    console.error("Error canceling expired bookings:", error);
  }
};

// confirm-booking
exports.ConfirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    // Update the booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "confirmed", paymentIntentId },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking confirmed!",
      booking,
    });
  } catch (error) {
    console.error("Confirmation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Run every minute
setInterval(cancelExpiredBookings, 60 * 1000);

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

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Find the corresponding payment record
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment || !payment.paymentIntentId) {
      return res
        .status(400)
        .json({ message: "Payment details not found for this booking" });
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
    });

    if (refund.status !== "succeeded") {
      return res.status(400).json({ message: "Refund failed" });
    }

    // Restore seat count
    const tour = await TourPackage.findById(booking.tourId);
    if (tour) {
      tour.availableSeats += 1;
      await tour.save();
      io.emit("seat-updated", {
        tourId: tour._id,
        availableSeats: tour.availableSeats,
      });
    }

    // Remove booking and payment record
    await Booking.findByIdAndDelete(bookingId);
    await Payment.findByIdAndDelete(payment._id);

    res
      .status(200)
      .json({ message: "Booking cancelled and refunded successfully." });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
