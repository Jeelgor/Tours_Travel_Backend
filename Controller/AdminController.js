const cloudinary = require('cloudinary').v2;
const TourPackageDetail = require('../models/TourDetail');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
      packageType
    } = req.body;

    // Log the received data for debugging
    console.log('Received data:', {
      _id,
      packageType,
      accessibility
    });

    // Handle gallery images upload
    const gallery = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'tour-packages',
          resource_type: 'auto',
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
      packageType
    });

    // Log the tourPackage object before saving
    console.log('Tour package before save:', tourPackage);

    await tourPackage.save();

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully',
      data: tourPackage
    });

  } catch (error) {
    console.error('Error creating tour package:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tour package',
      error: error.message
    });
  }
};

exports.updateTourPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const updateData = { ...req.body };

    // Handle new gallery images if any
    if (req.files && req.files.length > 0) {
      const gallery = [];
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'tour-packages',
          resource_type: 'auto',
        });
        
        gallery.push(result.secure_url);
      }
      updateData.gallery = gallery;
    }

    const tourPackage = await TourPackageDetail.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true }
    );

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tour package updated successfully',
      data: tourPackage
    });

  } catch (error) {
    console.error('Error updating tour package:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour package',
      error: error.message
    });
  }
}; 