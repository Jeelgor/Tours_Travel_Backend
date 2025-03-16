const Users = require("../../models/Users");
const OTP = require("../../models/OtpModel");
const sendotp = require("../../Utility/SendOptMailer");
const bcrypt = require("bcrypt");
const {
  authMiddleware,
  genrateToken,
} = require("../../middleware/authMiddleware ");
const jwt = require("jsonwebtoken");

// Register User
exports.RegisterUser = async (req, res) => {
  const {
    FirstName,
    LastName,
    Email,
    Password,
    SetPassword,
    Pincode,
    MobileNumber,
    Address,
  } = req.body;

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
      Password: hashedPassword,
      SetPassword,
      Pincode,
      MobileNumber,
      Address,
    });

    const response = await user.save();

    // Generate the payload and token
    const payload = {
      id: response.id,
      Email: response.Email,
    };
    console.log("Payload :", JSON.stringify(payload));
    const token = genrateToken(payload);
    console.log("Token is :", token);

    // Send response including user data and token
    res.status(200).json({
      msg: "User Registered Successfully",
      response,
      token,
    });
  } catch (error) {
    console.log("Error in RegisterUser:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Login User
exports.LoginUser = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const user = await Users.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Ensure you're comparing the Password with the correct field
    const isMatch = await bcrypt.compare(Password, user.SetPassword); // Assuming 'Password' is the field name
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user._id, // Ensure you're using the correct field for the user ID
      Email: user.Email,
    };

    console.log("Payload:", JSON.stringify(payload)); // Log the payload here

    const token = genrateToken(payload);
    console.log("Token is:", token); // Log the token

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

    // Include the token in the response
    res.status(200).json({
      message: "OTP sent to your email. Please verify OTP to complete login.",
      token, // Send the token in the response
    });
  } catch (error) {
    console.error("Error logging in user:", error); // Log the error
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    // Find OTP document by OTP code and Email
    const otpDoc = await OTP.findOne({ otp });
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (otpDoc.expiresAt < Date.now()) {
      await OTP.deleteOne({ otp }); // Optionally, remove expired OTP
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP verified successfully
    res
      .status(200)
      .json({ message: "OTP verified successfully. Login complete." });

    // Optionally, delete the OTP after successful verification
    await OTP.deleteOne({ otp });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error verifying OTP", error });
    }
  }
};

// Profile
exports.profile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Since authMiddleware is already adding user to req object
    // we can directly use req.user instead of verifying token again
    const userId = req.user.id;

    const { FirstName, LastName, Address, MobileNumber, Pincode } = req.body;

    // Find and update user
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(FirstName && { FirstName }),
          ...(LastName && { LastName }),
          ...(Address && { Address }),
          ...(MobileNumber && { MobileNumber }),
          ...(Pincode && { Pincode }),
        },
      },
      { new: true }
    ).select("-Password -SetPassword");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        FirstName: updatedUser.FirstName,
        LastName: updatedUser.LastName,
        Email: updatedUser.Email,
        Address: updatedUser.Address,
        MobileNumber: updatedUser.MobileNumber,
        Pincode: updatedUser.Pincode,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
