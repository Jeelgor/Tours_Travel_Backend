const TourDetail = require("../models/TourDetail");

exports.TourDetails = async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body
  console.log("Uploaded Files:", req.files); // Log the uploaded files

  if (!req.body.packages) {
    return res.status(400).json({ msg: "No packages provided." });
  }

  let TourPackagesArray;
  try {
    TourPackagesArray = JSON.parse(req.body.packages);
  } catch (error) {
    return res.status(400).json({ msg: "Invalid JSON format for packages." });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ msg: "No files uploaded." });
  }

  try {
    const packagesWithImages = TourPackagesArray.map((packageData, index) => {
      // Extract 3 images per package, assuming req.files is ordered correctly
      const galleryImages = req.files
        .slice(index * 3, index * 3 + 3)
        .map((file) => file.path);

      if (galleryImages.length !== 3) {
        throw new Error(`Package ${index + 1} requires exactly 3 images.`);
      }

      return {
        ...packageData,
        gallery: galleryImages, // Store the 3 images in the gallery array
      };
    });

    await TourDetail.insertMany(packagesWithImages);

    res.status(200).json({ msg: "Packages added successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to add packages, please try again.", error });
    console.log(error);
  }
};

exports.DeletePackagesDetails = async (req, res) => {
  try {
    await TourDetail.deleteMany({}); // This deletes all documents in the collection
    res.status(200).json({ msg: "All data has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to delete data", error });
  }
};

exports.getTourDetailPackages = async (req, res) => {
  try {
    const { pkgId } = req.params;

    const packageDetail = await TourDetail.findById(pkgId);

    if (!packageDetail) {
      return res.status(404).json({ msg: "Package not found." });
    }

    // console.log(packageDetail);
    res.status(200).json(packageDetail);
  } catch (error) {
    console.error("Error fetching package details:", error);
    res.status(500).json({ msg: "Failed to fetch package details.", error });
  }
};
