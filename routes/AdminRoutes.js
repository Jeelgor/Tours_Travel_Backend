const express = require("express");
const router = express.Router();
const upload = require("../multer/config");

const { authMiddleware } = require("../middleware/authMiddleware ");
const {
  getAdminTours,
  getAdminTourById,
  createAdminTour,
  updateAdminTour,
  deleteAdminTour,
  getTourDetails,
} = require("../Controller/AdminController/TourManagement");
const { updateTourPackage, AddTourPackage, EditTourPackage } = require("../Controller/AdminController");
const { getTourPackagesByid } = require("../Controller/TourPackagesController");

// Admin Login
// router.post("/admin/login", LoginUser);

// Tour Management (Admin Protected Routes)
router.get("/admin/tours", getAdminTours);
router.get("/admin/tours/:id", getAdminTourById);
router.post("/admin/tours", createAdminTour);
router.put("/admin/Updatetours/:id", updateAdminTour);
router.delete("/admin/tours/:id", deleteAdminTour);
router.get("/admin/tourdetails/:pkgId", getTourDetails);
router.get("/admin/tourpackagesadd",upload.array('imageurl', 10),AddTourPackage);
router.put("/admin/tourpackagesmodify", (req, res, next) => {
  console.log("Middleware is working, Body:", req.body);
  console.log("Files received:", req.files);
  next();
}, upload.single("imageurl", 10), EditTourPackage);

router.get("/admin/gettourpackages", getTourPackagesByid);

module.exports = router;
