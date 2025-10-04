const express = require("express");
const bodyParser = require("body-parser");

const {
  createPaymentIntent,
  cancelBooking,
} = require("../Controller/paymentController");
const { savePayment, getPayments } = require("../Controller/ConfimPayment");
const Booking = require("../models/Booking");
const { createCheckoutSession } = require("../Controller/BookingController");
const { authMiddleware } = require("../middleware/authMiddleware ");
const { default: Stripe } = require("stripe");
const TourPackages = require("../models/TourPackages");
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/save-payment", savePayment);
router.get("/getpayment", getPayments);
router.post("/cancel-booking", cancelBooking);
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);


module.exports = router;
