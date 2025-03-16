const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/UserRoutes");
const paymentRoutes = require("./routes/Paymentroutes");
const bookingRoutes = require("./routes/bookingRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const connectMongoose = require("./config/database");
const PORT = process.env.PORT || 3000;
const path = require("path");

// Connect to the database
connectMongoose();

// Middleware
app.use(
  cors({
    origin: [
      "https://tours-travel-one.vercel.app",
      "http://localhost:5173",
      "https://tours-travel-backend-five.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: true,
  })
);
app.use(express.json());

// Routes
app.use("/Auth/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", bookingRoutes);
// app.use("/process", AdminRoutes);
app.use("/api/tours",AdminRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ message: "Something went wrong!" });
});

// Export for Vercel
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.listen(PORT, () => {
  console.log("Server is Listening on PORT", PORT);
});
module.exports = app;
