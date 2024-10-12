const popularDestination = require("../models/Homepage");

exports.popularDestination = async (req, res) => {
  const { tourName, Description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const imgPath = req.file.path; 

    const newDestination = new popularDestination({
      img: imgPath,
      tourName,
      Description,
    });

    await newDestination.save();
    res.status(201).json({ msg: "Destination created successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create destination." });
  }
};
 