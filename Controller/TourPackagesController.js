const TourPackages = require("../models/TourPackages");
const { uploadFileToCloudinary } = require("../Utility/cloudinaryHelper");

exports.Tourpackages = async (req, res) => {
  if (!req.body.packages) {
    return res.status(400).json({ msg: "No packages provided." });
  }

  let TourPackagesArray;
  try {
    TourPackagesArray = typeof req.body.packages === "string"
      ? JSON.parse(req.body.packages)
      : req.body.packages;
  } catch (error) {
    return res.status(400).json({ msg: "Invalid JSON format for packages." });
  }

  try {
    const packagesWithImages = await Promise.all(
      TourPackagesArray.map(async (packageData, index) => {
        let imageurl = packageData.imageurl;
        if (req.files && req.files[index]) {
          const uploadedUrl = await uploadFileToCloudinary(req.files[index], "tour-packages");
          if (uploadedUrl) imageurl = uploadedUrl;
        }
        return {
          ...packageData,
          imageurl: imageurl || "",
        };
      })
    );

    await TourPackages.insertMany(packagesWithImages);
    res.status(200).json({ msg: "Packages added successfully!", count: packagesWithImages.length });
  } catch (error) {
    console.error("Error adding tour packages:", error);
    res.status(500).json({ msg: "Failed to add packages, please try again.", error: error.message });
  }
};

exports.DeletePackages = async (req, res) => {
  try {
    await TourPackages.deleteMany({});
    res.status(200).json({ msg: "All data has been deleted" });
  } catch (error) {
    console.error("Error deleting tour packages:", error);
    res.status(500).json({ msg: "Failed to delete data", error: error.message });
  }
};

exports.getTourPackages = async (req, res) => {
  try {
    const result = await TourPackages.find();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTourPackagesByid = async (req, res) => {
  try {
    const { pkgId } = req.query;
    if (pkgId) {
      const packageItem = await TourPackages.findOne({ _id: pkgId });
      if (!packageItem) {
        return res.status(404).json({ message: "Tour package not found" });
      }
      return res.status(200).json(packageItem);
    }

    const allPackages = await TourPackages.find();
    res.status(200).json(allPackages);
  } catch (error) {
    console.error("Error fetching package by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
