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
const { authMiddleware } = require("../middleware/authMiddleware ");
const {
  TourDetails,
  DeletePackagesDetails,
  getTourDetailPackages,
} = require("../Controller/TourDetailController");
const { createTourPackage, updateTourPackage } = require("../Controller/AdminController");

router.post("/register", RegisterUser);
router.post("/loginuser", LoginUser);
router.post("/verify-Otp", verifyOTP);
router.post("/popularDestination", upload.single("img"), popularDestination);
router.post("/upload", upload.single("image"), uploadImage);
router.post("/Addpackages", upload.array("imageurl", 40), Tourpackages);
router.post("/AddpackagesDetails", upload.array("gallery", 40), TourDetails);
router.delete("/DeletePackagesDetails", DeletePackagesDetails);
router.post("/deleteAllPackages", DeletePackages);
router.put("/admin/updatetourdetails",upload.single('imageurl', 10), updateTourPackage);

router.post('/tour-package',upload.array('gallery', 10),createTourPackage); // Multer middleware processes images

router.get("/userProfile", authMiddleware, profile);
router.get("/protected-route", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You have access to this protected route!",
    user: req.user,
  });
});
// get method
router.get("/getRegisteruser", RegisterUser);
router.get("/verify-Otp", verifyOTP);
router.get("/getLoginuser", LoginUser);
router.get("/getImages", getImages);
router.get("/FetchImageURL", FetchImageUrl);
router.get("/getTourPackages", getTourPackages);
router.get("/getTourDetailPackages/:pkgId", getTourDetailPackages);
router.put("/updateProfile", authMiddleware, updateUserProfile);
module.exports = router;
