const cloudinary = require("../Utility/setup");
exports.uploadImage = async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  try {
    // Upload the file to Cloudinary
    const filePath = req.file.path;
    console.log(filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "TourandTravel",
    });

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
