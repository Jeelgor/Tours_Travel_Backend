const Booking = require("../models/Booking"); // Assuming the Booking model is in the "models" folder
const mongoose = require("mongoose");
const TourPackages = require("../models/TourPackages");

// Controller to handle booking creation
exports.createBooking = async (req, res) => {
  try {
    const { 
      packageId, 
      userId,
      name,
      email,
      numberOfTravelers,
      specialRequests,
      fromDate,
      toDate,
      address,     // New field
      mobileNumber, // New field
      pincode      // New field
    } = req.body;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const tour = await TourPackages.findById(packageId);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    if (tour.seatsLeft <= 0)
      return res.status(400).json({ message: "No seats available" });

    // Create a new booking with the data from the request body
    const booking = new Booking({
      userId,
      name,
      email,
      numberOfTravelers,
      specialRequests,
      packageId,
      fromDate,
      toDate,
      address,      // New field
      mobileNumber, // New field
      pincode,      // New field
    });

    // Save the booking to the database
    await booking.save();

    // Update seats
    const UpdateSeat = await TourPackages.findByIdAndUpdate(
      packageId,
      { $inc: { Seatleft: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      Seatleft: UpdateSeat.Seatleft,
      booking: booking // Return the booking object
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
