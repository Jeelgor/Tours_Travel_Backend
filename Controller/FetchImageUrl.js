const ClodinaryImageModel = require("../models/ClodinaryImageModel");

exports.FetchImageUrl = async (req, res) => {
  try {
    const images = await ClodinaryImageModel.find(); // Fetch all image URLs
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ msg: "Error fetching images from database" });
    }
  }
};
