const express = require("express");
const router = express.Router();
const upload = require("../multer/config")

const { RegisterUser, LoginUser ,verifyOTP} = require("../Controller/userController");
const { popularDestination } = require("../Controller/popularDestinationController");
const { uploadImage } = require("../Cloudinary/work");
const {getImages} = require("../Cloudinary/FetchImage")


router.post("/register", RegisterUser);
router.post("/loginuser", LoginUser);
router.post("/verify-Otp",verifyOTP);
router.post("/popularDestination",upload.single("img"),popularDestination);
router.post("/upload",upload.single("image"),uploadImage);
// get method
router.get("/getRegisteruser", RegisterUser);
router.get("/verify-Otp",verifyOTP);
router.get("/getLoginuser", LoginUser);
router.get("/getImages",getImages);
module.exports = router;
