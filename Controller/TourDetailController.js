const TourDetail = require("../models/TourDetail");
const { uploadFileToCloudinary } = require("../Utility/cloudinaryHelper");

exports.TourDetails = async (req, res) => {
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
    const uploadedFiles = req.files || [];
    const packagesWithImages = await Promise.all(
      TourPackagesArray.map(async (packageData, index) => {
        // Find corresponding images if uploaded
        const sliceStart = index * 3;
        const packageFiles = uploadedFiles.slice(sliceStart, sliceStart + 3);

        const uploadedGallery = await Promise.all(
          packageFiles.map(file => uploadFileToCloudinary(file, "tour-packages"))
        );

        const gallery = uploadedGallery.filter(Boolean);
        const finalGallery = gallery.length > 0 ? gallery : (packageData.gallery || []);

        return {
          ...packageData,
          gallery: finalGallery,
        };
      })
    );

    await TourDetail.insertMany(packagesWithImages);
    res.status(200).json({ msg: "Packages added successfully!", count: packagesWithImages.length });
  } catch (error) {
    console.error("Error adding tour details:", error);
    res.status(500).json({ msg: "Failed to add packages, please try again.", error: error.message });
  }
};

exports.DeletePackagesDetails = async (req, res) => {
  try {
    await TourDetail.deleteMany({});
    res.status(200).json({ msg: "All data has been deleted" });
  } catch (error) {
    console.error("Error deleting tour details:", error);
    res.status(500).json({ msg: "Failed to delete data", error: error.message });
  }
};

exports.getTourDetailPackages = async (req, res) => {
  try {
    const { pkgId } = req.params;
    const packageDetail = await TourDetail.findById(pkgId);

    if (!packageDetail) {
      return res.status(404).json({ msg: "Package not found." });
    }

    res.status(200).json(packageDetail);
  } catch (error) {
    console.error("Error fetching package details:", error);
    res.status(500).json({ msg: "Failed to fetch package details.", error: error.message });
  }
};
