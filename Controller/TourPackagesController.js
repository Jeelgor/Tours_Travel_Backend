const TourPackages = require("../models/TourPackages");

exports.Tourpackages = async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body
  console.log("Uploaded Files:", req.files); // Log the uploaded files

  // Check if packages are provided
  if (!req.body.packages) {
    return res.status(400).json({ msg: "No packages provided." });
  }

  let TourPackagesArray;
  try {
    // Parse the packages JSON string
    TourPackagesArray = JSON.parse(req.body.packages);
  } catch (error) {
    return res.status(400).json({ msg: "Invalid JSON format for packages." });
  }

  // Check if files are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ msg: "No files uploaded." });
  }

  try {
    // Prepare package data with the uploaded image URLs
    const packagesWithImages = TourPackagesArray.map((packageData, index) => {
      return {
        ...packageData,
        imageurl: req.files[index] ? req.files[index].path : null, // Use the path of the uploaded file
      };
    });

    // Insert packages with their images into MongoDB
    await TourPackages.insertMany(packagesWithImages);

    res.status(200).json({ msg: "Packages added successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to add packages, please try again.", error });
    console.log(error);
  }
};

exports.DeletePackages = async (req, res) => {
  try {
    await TourPackages.deleteMany({}); // This deletes all documents in the collection
    res.status(200).json({ msg: "All data has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to delete data", error });
  }
};

exports.getTourPackages = async (req, res) => {
  try {
    const result = await TourPackages.find();
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
