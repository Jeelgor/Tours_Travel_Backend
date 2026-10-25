const express = require("express");
const {
  createPaymentIntent,
  cancelBooking,
} = require("../Controller/paymentController");
const { savePayment, getPayments } = require("../Controller/ConfimPayment");
const { createCheckoutSession } = require("../Controller/BookingController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-payment-intent", authMiddleware, createPaymentIntent);
router.post("/save-payment", authMiddleware, savePayment);
router.get("/getpayment", authMiddleware, getPayments);
router.post("/cancel-booking", authMiddleware, cancelBooking);
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

module.exports = router;
