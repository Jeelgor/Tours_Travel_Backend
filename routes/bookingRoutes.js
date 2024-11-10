const express = require("express");
const router = express.Router();
const BookingController = require("../Controller/BookingController");

// Create a new booking
router.post("/book", BookingController.createBooking);

// Get all bookings
router.get("/bookings", BookingController.getBookings);

// Get a booking by ID
router.get("/booking/:bookingId", BookingController.getBookingById);

// Update a booking by ID (e.g., after payment)
router.put("/booking/:bookingId", BookingController.updateBooking);

// Delete a booking by ID
router.delete("/booking/:bookingId", BookingController.deleteBooking);

module.exports = router;
