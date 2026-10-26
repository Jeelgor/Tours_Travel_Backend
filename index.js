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

// Start background cron jobs only in persistent environments (not serverless)
if (!process.env.VERCEL) {
  startCronJobs();
}

// Robust CORS Middleware supporting local & Vercel deployment origins
const allowedOrigins = [
  "https://tours-travel-one.vercel.app",
  "https://tours-travel-backend-five.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Middleware to ensure DB connection is ready before handling requests
app.use(async (req, res, next) => {
  try {
    await connectMongoose();
    next();
  } catch (err) {
    console.error("Database connection failure:", err.message);
    return res.status(503).json({
      message: "Database connection temporarily unavailable. Please verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0).",
      error: err.message,
    });
  }
});

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

// Start server locally (skip inside Vercel serverless functions)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Server is listening on PORT", PORT);
  });
}

module.exports = app;
