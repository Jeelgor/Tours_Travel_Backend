const express = require("express");
const router = express.Router();
const upload = require("../multer/config");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
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

// Tour Management (Admin Protected Routes)
router.get("/admin/tours", getAdminTours);
router.get("/admin/tours/:id", getAdminTourById);
router.post("/admin/tours", authMiddleware, adminMiddleware, createAdminTour);
router.put("/admin/Updatetours/:id", authMiddleware, adminMiddleware, updateAdminTour);
router.delete("/admin/tours/:id", authMiddleware, adminMiddleware, deleteAdminTour);
router.get("/admin/tourdetails/:pkgId", getTourDetails);
router.post("/admin/tourpackagesadd", authMiddleware, adminMiddleware, upload.array("imageurl", 10), AddTourPackage);
router.put("/admin/tourpackagesmodify", authMiddleware, adminMiddleware, upload.single("imageurl"), EditTourPackage);
router.get("/admin/gettourpackages", getTourPackagesByid);

module.exports = router;
