const Payment = require("../models/PaymentModel");
const User = require("../models/Users");
const Booking = require("../models/Booking");
const { sendBookingConfirmation } = require("../Utility/emailService");

// Save payment details
exports.savePayment = async (req, res) => {
  const {
    userId,
    userEmail,
    paymentIntentId,
    amount,
    packageName,
    status,
    paymentMethod,
    bookingId,
  } = req.body;

  try {
    const targetUserId = req.user?.id || userId;
    const targetEmail = req.user?.Email || userEmail;

    // Check if booking exists
    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
    }

    const newPayment = new Payment({
      userId: targetUserId,
      userEmail: targetEmail,
      paymentIntentId,
      amount,
      packageName,
      status: status || "succeeded",
      paymentMethod: paymentMethod || "card",
      paymentDate: new Date(),
      bookingId: booking ? booking._id : undefined,
    });

    await newPayment.save();

    if (booking) {
      booking.status = "confirmed";
      await booking.save();

      // Send confirmation email asynchronously
      sendBookingConfirmation(targetEmail, {
        _id: booking._id,
        name: booking.name,
        email: targetEmail,
        packageId: booking.packageId,
        fromDate: booking.fromDate,
        toDate: booking.toDate,
        status: booking.status,
      }).catch((err) => console.error("Email send error:", err));
    }

    res.status(200).json({
      message: "Payment saved successfully, Booking Confirmed!",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get payments (Admins get all, regular users get only their own)
exports.getPayments = async (req, res) => {
  try {
    const filter = req.user && req.user.role === "admin" ? {} : { userId: req.user?.id };
    const payments = await Payment.find(filter);

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, unable to fetch payments",
    });
  }
};
