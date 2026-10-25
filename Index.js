const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const aiRoutes = require("./routes/ai.routes");
const stripeRoutes = require("./routes/stripe");

// Import DB, socket setup & background jobs
const connectMongoose = require("./config/database");
const { setupSocket } = require("./realtime/socket");
const { startCronJobs } = require("./Utility/cronJobs");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://tours-travel-one.vercel.app",
      "https://tours-travel-backend-five.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Connect to MongoDB
connectMongoose();

// Initialize sockets
setupSocket(io);

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
server.listen(PORT, () => {
  console.log("Server is listening on PORT", PORT);
});

module.exports = app;
