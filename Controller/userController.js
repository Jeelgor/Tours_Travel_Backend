const Users = require("../models/Users");
const OTP = require("../models/OtpModel");
const sendotp = require("../Utility/SendOptMailer");
const bcrypt = require("bcrypt");
exports.RegisterUser = async (req, res) => {
  const { FirstName, LastName, Email, Password, SetPassword } = req.body;

  try {
    // Check if user already exists
    let user = await Users.findOne({ Email });
    if (user) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create new user with hashed password
    user = new Users({
      FirstName,
      LastName,
      Email,
      Password: hashedPassword, // Store the hashed password
      SetPassword,
    });

    await user.save();
    res.status(200).json({ msg: "User Registered Successfully" });
  } catch (error) {
    console.log("Error in RegisterUser:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};
exports.LoginUser = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const user = await Users.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const isMatch = await bcrypt.compare(Password, user.SetPassword);
    if (!isMatch) {
      console.log(Password);
      console.log(SetPassword);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendotp(Email, otp);

    // Save OTP in the database
    const otpDoc = new OTP({
      Email: Email,
      otp: otp,
      expiresAt: Date.now() + 300000, // Expires in 5 minutes
    });
    await otpDoc.save();

    res.status(200).json({
      message: "OTP sent to your email. Please verify OTP to complete login.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error });
  }
};

exports.verifyOTP = async (req, res) => {
  const { Email, otp } = req.body;

  try {
    const otpDoc = await OTP.findOne({ Email, otp });
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified successfully
    res
      .status(200)
      .json({ message: "OTP verified successfully. Login complete." });

    // Optionally, delete the OTP after verification
    await OTP.deleteOne({ Email, otp });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};
