const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const userRoutes = require("./routes/UserRoutes");
// Import database file
const connectMongoose = require("./config/database");
connectMongoose();

app.use(express.json());
app.use(cors());
// routes
app.use("/Auth/users", userRoutes);
app.use('/uploads', express.static('uploads')); // This line serves the uploads folder
app.listen(PORT, () => {
  console.log("Server is Running on Port", PORT);
}); 
