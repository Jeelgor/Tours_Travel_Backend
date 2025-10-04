const express = require("express");
const cors = require("cors");
const http = require("http");
const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const aiRoutes = require("./routes/ai.routes");
const stripeRoutes = require("./routes/stripe");

// Import DB & socket setup
const connectMongoose = require("./config/database");
const { setupSocket } = require("./realtime/socket");

// Stripe webhook handler
const { stripeWebhookHandler } = require("./Controller/stripeWebhookHandler");

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
    preflightContinue: true,
  })
);

// **Stripe webhook must be BEFORE express.json()**
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookHandler
);

// Middleware to parse JSON for all other routes
app.use(express.json());

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/Auth/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", bookingRoutes);
app.use("/api/tours", AdminRoutes);
app.use("/api/stripe", stripeRoutes); // Stripe routes (create checkout session, etc.)
app.use("/api/ai", aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ message: "Something went wrong!" });
});

// Start server
server.listen(PORT, () => {
  console.log("Server is listening on PORT", PORT);
});

module.exports = app;