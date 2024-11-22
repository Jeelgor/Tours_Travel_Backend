const express = require("express");

const { createPaymentIntent } = require("../Controller/paymentController");
const { savePayment, getPayments } = require("../Controller/ConfimPayment");
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/save-payment", savePayment);
router.get("/getpayment", getPayments);
module.exports = router;
