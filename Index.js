const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const connectMongoose = require("./config/database");

// Connect to the database
connectMongoose();

// CORS configuration
app.use(
  cors({
    origin: "https://tours-travel-nine.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Middleware
app.use(express.json());
app.options("*", cors());
// Routes
app.use("/Auth/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", bookingRoutes);

// Export for Vercel
module.exports = app;
