const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const aiRoutes = require("./routes/ai.routes");
const stripeRoutes = require("./routes/stripe");

// Import DB & background jobs
const connectMongoose = require("./config/database");
const { startCronJobs } = require("./Utility/cronJobs");

const PORT = process.env.PORT || 3000;
const app = express();

// Connect to MongoDB
connectMongoose();

// Start background cron jobs (e.g. seat restoration for expired bookings)
startCronJobs();

// CORS Middleware
app.use(
  cors({
    origin: [
      "https://tours-travel-one.vercel.app",
      "http://localhost:5173",
      "https://tours-travel-backend-five.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight for all routes
app.options("*", cors());

// Middleware to parse JSON while retaining raw buffer for Stripe Webhook
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes("/api/stripe/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/Auth/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", bookingRoutes);
app.use("/api/tours", AdminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/ai", aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong!" });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log("Server is listening on PORT", PORT);
  });
}

module.exports = app;
