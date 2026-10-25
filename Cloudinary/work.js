const { uploadFileToCloudinary, cloudinary } = require("../Utility/cloudinaryHelper");
const imageModel = require("../models/ClodinaryImageModel");

// Function to upload image
exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  try {
    const imageUrl = await uploadFileToCloudinary(req.file, "TourandTravel");
    if (!imageUrl) {
      return res.status(500).json({ msg: "Failed to upload image to Cloudinary." });
    }

    // Call the function to fetch and store images after successful upload
    await getImages();

    res.status(200).json({
      success: true,
      msg: "Image uploaded successfully.",
      url: imageUrl,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ msg: "Error in Cloudinary setup.", error: err.message });
  }
};

// Function to fetch images and store URLs in MongoDB
const getImages = async () => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "TourandTravel/",
    });

    const images = (result.resources || []).map((resource) => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));

    if (images.length > 0) {
      await imageModel.insertMany(images, { ordered: false }).catch(() => {});
    }
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
  }
};

exports.getImages = getImages;
