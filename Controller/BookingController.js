const Booking = require("../models/Booking"); // Assuming the Booking model is in the "models" folder
const mongoose = require("mongoose");
const TourPackages = require("../models/TourPackages");
const User = require("../models/Users");

// Controller to handle booking creation
exports.createBooking = async (req, res) => {
  try {
    const {
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
    const userId = req.user.id; // Assuming you're using authMiddleware

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User authentication required" 
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Validate tour package
    const tour = await TourPackages.findById(packageId);
    if (!tour) {
      return res.status(404).json({ 
        success: false,
        message: "Tour not found" 
      });
    }

    if (tour.Seatleft <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "No seats available" 
      });
    }

    // Create booking
    const booking = new Booking({
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
    });

    await booking.save();

    // Update seats
    const updatedTour = await TourPackages.findByIdAndUpdate(
      packageId,
      { $inc: { Seatleft: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      seatsLeft: updatedTour.Seatleft,
      booking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error, unable to create booking",
      error: error.message
    });
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
