const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const connectMongoose = require("./config/database");
const PORT = process.env.PORT || 3000;
const path = require('path');

// Connect to the database
connectMongoose();

// Middleware
app.use(cors({
  origin: ['https://tours-travel-one.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use("/Auth/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", bookingRoutes);

// Export for Vercel
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.listen(PORT, () => {
  console.log("Server is Listing on PORT", PORT);
});
module.exports = app;
