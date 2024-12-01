const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const userRoutes = require("./routes/UserRoutes");
// Import database file
const connectMongoose = require("./config/database");
connectMongoose();
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

// routes
app.use("/Auth/users", userRoutes);
app.use("/uploads", express.static("uploads"));
const paymentRoutes = require("./routes/Paymentroutes");
app.use("/api/payment", paymentRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api", bookingRoutes);

app.listen(PORT, () => {
  console.log("Server is Running on Port", PORT);
});
