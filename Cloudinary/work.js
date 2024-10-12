// Cloudinary and other setup
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const imageModel = require("../models/ClodinaryImageModel");
const cloudinarysetup = require("../Utility/setup");

dotenv.config(); // Load environment variables from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image
exports.uploadImage = async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  try {
    // Upload the file to Cloudinary
    const filePath = req.file.path;
    console.log(filePath);
    const result = await cloudinarysetup.uploader.upload(filePath, {
      folder: "TourandTravel",
    });

    // Call the function to fetch and store images after successful upload
    await getImages(); // Call the getImages function directly

    res.status(200).json({
      success: true,
      msg: "Image uploaded successfully.",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error in Cloudinary setup." });
  }
};

// Function to fetch images and store URLs in MongoDB
const getImages = async () => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "TourandTravel/",
    });

    const images = result.resources.map((resource) => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));

    // Save each image URL in MongoDB
    const savedImages = await imageModel.insertMany(images);
    console.log(savedImages);
    // You might want to handle the response differently based on your app's structure
  } catch (error) {
    console.error(error);
  }
};
