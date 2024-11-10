const Booking = require("../models/Booking"); // Assuming the Booking model is in the "models" folder
const mongoose = require("mongoose");

// Controller to handle booking creation
exports.createBooking = async (req, res) => {
  try {
    // Check if packageId is provided and is a valid string
    if (!req.body.packageId || typeof req.body.packageId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing package ID",
      });
    }

    // Create a new booking with the data from the request body
    const booking = new Booking({
      name: req.body.name,
      email: req.body.email,
      numberOfTravelers: req.body.numberOfTravelers,
      specialRequests: req.body.specialRequests,
      packageId: req.body.packageId, // Using the custom string packageId
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
    });

    // Save the booking to the database
    await booking.save();

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Booking created successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating booking:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "Server error, unable to create booking",
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
