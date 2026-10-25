const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dmobhblzn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a multer file (buffer or disk) to Cloudinary
 * @param {Object} file - Multer file object
 * @param {String} folder - Cloudinary target folder
 * @returns {Promise<String>} - Secure URL of uploaded image
 */
const uploadFileToCloudinary = async (file, folder = "tour-packages") => {
  if (!file) return null;

  try {
    let source;
    if (file.buffer) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      source = `data:${file.mimetype || "image/jpeg"};base64,${b64}`;
    } else if (file.path) {
      source = file.path;
    } else {
      return null;
    }

    const result = await cloudinary.uploader.upload(source, {
      folder,
      resource_type: "auto",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // If Cloudinary fails, return a placeholder or null
    return file.path ? `/uploads/${file.filename}` : null;
  }
};

module.exports = {
  cloudinary,
  uploadFileToCloudinary,
};
