const cloudinary = require("cloudinary").v2;
const TourPackageDetail = require("../models/TourDetail");
const TourPackages = require("../models/TourPackages");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createTourPackage = async (req, res) => {
  try {
    const {
      _id,
      overview,
      amenities,
      aboutProperty,
      accessibility,
      commonAreas,
      packageType,
    } = req.body;

    // Log the received data for debugging
    console.log("Received data:", {
      _id,
      packageType,
      accessibility,
    });

    // Handle gallery images upload
    const gallery = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "tour-packages",
          resource_type: "auto",
        });

        gallery.push(result.secure_url);
      }
    }

    // Create new tour package with explicit _id
    const tourPackage = new TourPackageDetail({
      _id: _id,
      gallery,
      overview: JSON.parse(overview),
      amenities: JSON.parse(amenities),
      aboutProperty: JSON.parse(aboutProperty),
      accessibility,
      commonAreas: JSON.parse(commonAreas),
      packageType,
    });

    // Log the tourPackage object before saving
    console.log("Tour package before save:", tourPackage);

    await tourPackage.save();

    res.status(201).json({
      success: true,
      message: "Tour package created successfully",
      data: tourPackage,
    });
  } catch (error) {
    console.error("Error creating tour package:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tour package",
      error: error.message,
    });
  }
};

exports.updateTourPackage = async (req, res) => {
  try {
    const { pkgId } = req.query;
    const updatedData = req.body;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "tour-packages",
        resource_type: "auto",
      });

      // Save the Cloudinary URL to the DB
      updatedData.imageurl = result.secure_url;
    }

    const updatedPackage = await TourPackages.findByIdAndUpdate(
      pkgId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Tour package not found" });
    }

    res.status(200).json(updatedPackage);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating tour package" });
  }
};

// TourPackages Admin Side

exports.AddTourPackage = async (req, res) => {
  try {
    const {
      _id,
      title,
      location,
      imageurl,
      highlights,
      rating,
      price,
      currency,
      Seatleft,
    } = req.body;

    console.log("Received data:", { _id, title, location });

    // Create new tour package
    const tourPackage = new TourPackages({
      _id,
      title,
      location,
      imageurl,
      highlights,
      rating,
      price,
      currency,
      Seatleft,
    });

    console.log("Tour package before save:", tourPackage);

    await tourPackage.save();

    res.status(201).json({
      success: true,
      message: "Tour package created successfully",
      data: tourPackage,
    });
  } catch (error) {
    console.error("Error creating tour package:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tour package",
      error: error.message,
    });
  }
};

exports.EditTourPackage = async (req, res) => {
  try {
    const { pkgId } = req.query;
    if (!pkgId) {
      return res
        .status(400)
        .json({ success: false, message: "pkgId is required" });
    }

    const existingTourPackage = await TourPackages.findById(pkgId);
    if (!existingTourPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Tour package not found" });
    }

    let updateData = {};
    const allowedFields = [
      "title",
      "location",
      "imageurl",
      "highlights",
      "rating",
      "price",
      "currency",
      "Seatleft",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    // Handle new gallery images if provided
    console.log("image uplaod operation on");
    if (req.files && req.files.length > 0) {
      const imageurl = [];
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "tour-packages",
          resource_type: "auto",
        });
        imageurl.push(result.secure_url);
        console.log(imageurl, 22222222);
      }
      updateData.imageurl = imageurl;
    }

    const updatedTourPackage = await TourPackages.findByIdAndUpdate(
      pkgId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Tour package updated successfully",
      data: updatedTourPackage,
    });
  } catch (error) {
    console.error("Error updating tour package:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tour package",
      error: error.message,
    });
  }
};
