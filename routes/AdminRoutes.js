const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware ");
const {
  getAdminTours,
  getAdminTourById,
  createAdminTour,
  updateAdminTour,
  deleteAdminTour,
  getTourDetails,
} = require("../Controller/AdminController/TourManagement");
const { updateTourPackage } = require("../Controller/AdminController");
const upload = require("../multer/config");

// Admin Login
// router.post("/admin/login", LoginUser);

// Tour Management (Admin Protected Routes)
router.get("/admin/tours", getAdminTours);
router.get("/admin/tours/:id", getAdminTourById);
router.post("/admin/tours", createAdminTour);
router.put("/admin/Updatetours/:id", updateAdminTour);
router.delete("/admin/tours/:id", deleteAdminTour);
router.get("/admin/tourdetails/:pkgId", getTourDetails);

module.exports = router;
