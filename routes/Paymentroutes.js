const express = require("express");

const { createPaymentIntent, cancelBooking } = require("../Controller/paymentController");
const { savePayment, getPayments } = require("../Controller/ConfimPayment");
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/save-payment", savePayment);
router.get("/getpayment", getPayments);
router.post("/cancel-booking", cancelBooking);
module.exports = router;
