const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const imageModel = require("../models/ClodinaryImageModel");
const { url } = require("../Utility/setup");

dotenv.config(); // Load environment variables from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getImages = async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "TourandTravel/",
    });

    const images = result.resources.map((resource) => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error Fetching Images From Cloudinary" });
  }
};
