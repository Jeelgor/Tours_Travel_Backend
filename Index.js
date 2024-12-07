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
    origin: ["http://localhost:5173", "https://tours-travel-tau.vercel.app/"],
    headers: ["Content-Type"],
    methods: ["POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.options('*', cors())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tours-travel-tau.vercel.app/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// console.log(process.env.ORIGIN, 2131);

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
