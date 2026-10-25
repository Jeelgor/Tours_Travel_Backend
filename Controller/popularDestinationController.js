const popularDestination = require("../models/Homepage");
const { uploadFileToCloudinary } = require("../Utility/cloudinaryHelper");

exports.popularDestination = async (req, res) => {
  const { tourName, Description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed: No image file provided" });
    }

    const imgUrl = await uploadFileToCloudinary(req.file, "popular-destinations");
    if (!imgUrl) {
      return res.status(500).json({ message: "Failed to upload image to cloud storage" });
    }

    const newDestination = new popularDestination({
      img: imgUrl,
      tourName,
      Description,
    });

    await newDestination.save();
    res.status(201).json({ msg: "Destination created successfully!", data: newDestination });
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({ message: "Failed to create destination.", error: error.message });
  }
};
