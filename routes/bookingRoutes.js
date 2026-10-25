const express = require("express");
const router = express.Router();
const BookingController = require("../Controller/BookingController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Get bookings (filtered by user, or all if admin)
router.get("/bookings", authMiddleware, BookingController.getBookings);

// Get a booking by ID
router.get("/booking/:bookingId", authMiddleware, BookingController.getBookingById);

// Update a booking by ID
router.put("/booking/:bookingId", authMiddleware, BookingController.updateBooking);

// Delete a booking by ID
router.delete("/booking/:bookingId", authMiddleware, BookingController.deleteBooking);

// Cancel Booking
router.post("/CancleBooking", authMiddleware, BookingController.CancleBooking);
router.post("/cancelBooking", authMiddleware, BookingController.CancleBooking);

// Cancel expired bookings (support standard and legacy path)
router.post("/cancel-expired-bookings", BookingController.cancelExpiredBookings);
router.post("/api/cancel-expired-bookings", BookingController.cancelExpiredBookings);

// Vercel Cron endpoint
router.get("/cron", BookingController.cancelExpiredBookings);
router.post("/cron", BookingController.cancelExpiredBookings);

module.exports = router;
