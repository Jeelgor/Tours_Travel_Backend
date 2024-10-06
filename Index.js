const express = require("express");
const app = express();
const PORT = 3000;
const userRoutes = require("./routes/UserRoutes");
// Import database file
const connectMongoose = require("./config/database");
connectMongoose();

app.use(express.json());

// routes
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server is Running on Port", PORT);
});
