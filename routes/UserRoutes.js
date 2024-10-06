const express = require("express");
const router = express.Router();

const { RegisterUser, LoginUser ,verifyOTP} = require("../Controller/userController");

router.post("/register", RegisterUser);
router.post("/loginuser", LoginUser);
router.post("/verify-Otp",verifyOTP);
// get method
router.get("/getRegisteruser", RegisterUser);
router.get("/verify-Otp",verifyOTP);
router.get("/getLoginuser", LoginUser);

module.exports = router;
