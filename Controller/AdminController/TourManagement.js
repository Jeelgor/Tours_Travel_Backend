const mongoose = require("mongoose");
const TourDetail = require("../../models/TourDetail");
const Tour = require("../../models/TourPackages");

// @desc Get all tours (Admin Panel)
// @route GET /api/tours/admin/tours
exports.getAdminTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tours", error: error.message });
  }
};

// @desc Get a single tour by ID (Admin Panel)
// @route GET /api/tours/admin/tours/:id
exports.getAdminTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tour", error: error.message });
  }
};

// @desc Create a new tour (Admin Panel)
// @route POST /api/tours/admin/tours
exports.createAdminTour = async (req, res) => {
  try {
    const {
      _id,
      title,
      name,
      location,
      imageurl,
      image,
      highlights,
      description,
      rating,
      price,
      currency,
      Seatleft,
    } = req.body;

    const tourData = {
      _id: _id || new mongoose.Types.ObjectId().toString(),
      title: title || name || "Untitled Tour",
      location: location || "Global",
      imageurl: imageurl || image || "",
      highlights: highlights || (description ? [description] : ["Top Destination"]),
      rating: Number(rating) || 5,
      price: String(price || "0"),
      currency: currency || "$",
      Seatleft: Seatleft !== undefined ? Number(Seatleft) : 10,
    };

    const newTour = new Tour(tourData);
    await newTour.save();
    res.status(201).json(newTour);
  } catch (error) {
    console.error("Error creating tour:", error);
    res.status(500).json({ message: "Error creating tour", error: error.message });
  }
};

// @desc Update a tour (Admin Panel)
// @route PUT /api/tours/admin/Updatetours/:id
exports.updateAdminTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTour)
      return res.status(404).json({ message: "Tour not found" });
    res.status(200).json(updatedTour);
  } catch (error) {
    res.status(500).json({ message: "Error updating tour", error: error.message });
  }
};

// @desc Delete a tour (Admin Panel)
// @route DELETE /api/tours/admin/tours/:id
exports.deleteAdminTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    if (!deletedTour)
      return res.status(404).json({ message: "Tour not found" });
    res.status(200).json({ message: "Tour deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tour", error: error.message });
  }
};

exports.getTourDetails = async (req, res) => {
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
