const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

// Configuration
cloudinary.config({
  cloud_name: "dmobhblzn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);
