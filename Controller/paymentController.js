const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51QJ6lyENCwtICJmBwethLRkmCm89lgmZ2PwHKioNk5HLsUKR5aBhB2TdBqEe65rhflIcAW1Cl3SzoU4PNGrNRyy100hM5oWrxE"
);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { price } = req.body; // Price should be sent from the frontend

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100, // Stripe expects the price in the smallest currency unit (e.g., cents for USD)
      currency: "usd", // Change this to the currency you're using
    });

    res.send({
      clientSecret: paymentIntent.client_secret, // Send the clientSecret back to the frontend
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({ error: "Payment intent creation failed" });
  }
};
