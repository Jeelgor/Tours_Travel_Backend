const express = require("express");
const router = express.Router();
const upload = require("../multer/config");

const {
  RegisterUser,
  LoginUser,
  verifyOTP,
  profile,
  updateUserProfile,
} = require("../Controller/userController");
const {
  popularDestination,
} = require("../Controller/popularDestinationController");
const { uploadImage } = require("../Cloudinary/work");
const { getImages } = require("../Cloudinary/FetchImage");
const {
  Tourpackages,
  DeletePackages,
  getTourPackages,
} = require("../Controller/TourPackagesController");
const { FetchImageUrl } = require("../Controller/FetchImageUrl");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const {
  TourDetails,
  DeletePackagesDetails,
  getTourDetailPackages,
} = require("../Controller/TourDetailController");
const { createTourPackage, updateTourPackage } = require("../Controller/AdminController");

// User Auth
router.post("/register", RegisterUser);
router.post("/loginuser", LoginUser);
router.post("/verify-Otp", verifyOTP);

// Content creation & management (Admin protected)
router.post("/popularDestination", authMiddleware, adminMiddleware, upload.single("img"), popularDestination);
router.post("/upload", authMiddleware, adminMiddleware, upload.single("image"), uploadImage);
router.post("/Addpackages", authMiddleware, adminMiddleware, upload.array("imageurl", 40), Tourpackages);
router.post("/AddpackagesDetails", authMiddleware, adminMiddleware, upload.array("gallery", 40), TourDetails);
router.delete("/DeletePackagesDetails", authMiddleware, adminMiddleware, DeletePackagesDetails);
router.post("/deleteAllPackages", authMiddleware, adminMiddleware, DeletePackages);
router.put("/admin/updatetourdetails", authMiddleware, adminMiddleware, upload.single("imageurl"), updateTourPackage);
router.post("/tour-package", authMiddleware, adminMiddleware, upload.array("gallery", 10), createTourPackage);

// User Profile
router.get("/userProfile", authMiddleware, profile);
router.put("/updateProfile", authMiddleware, updateUserProfile);
router.get("/protected-route", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You have access to this protected route!",
    user: req.user,
  });
});

// Public GET queries
router.get("/getImages", getImages);
router.get("/FetchImageURL", FetchImageUrl);
router.get("/getTourPackages", getTourPackages);
router.get("/getTourDetailPackages/:pkgId", getTourDetailPackages);

module.exports = router;
