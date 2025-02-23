const Users = require("../models/Users");
const OTP = require("../models/OtpModel");
const sendotp = require("../Utility/SendOptMailer");
const bcrypt = require("bcrypt");
const {
  authMiddleware,
  genrateToken,
} = require("../middleware/authMiddleware ");
const jwt = require('jsonwebtoken');

// Register User
exports.RegisterUser = async (req, res) => {
  const { 
    FirstName, 
    LastName, 
    Email, 
    Password, 
    SetPassword,
    Address,
    MobileNumber,
    Pincode 
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

    // Create new user with hashed password and new fields
    user = new Users({
      FirstName,
      LastName,
      Email,
      Password: hashedPassword,
      SetPassword,
      Address,
      MobileNumber,
      Pincode
    });

    const response = await user.save();

    // Generate the payload and token
    const payload = {
      id: response.id,
      Email: response.Email,
    };
    
    const token = genrateToken(payload);

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

    const isMatch = await bcrypt.compare(Password, user.SetPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user._id,
      Email: user.Email,
    };

    const token = genrateToken(payload);

    // Send token in response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        email: user.Email
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error logging in user", 
      error: error.message 
    });
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
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRATE_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // Check if decoded.id exists
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    const user = await Users.findById(decoded.id)
      .select("-Password -SetPassword");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Address: user.Address,
        MobileNumber: user.MobileNumber,
        Pincode: user.Pincode
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Update Profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRATE_KEY);
    const userId = decoded.id;

    const { FirstName, LastName, Address, MobileNumber, Pincode } = req.body;

    // Validate the input
    if (!FirstName && !LastName && !Address && !MobileNumber && !Pincode) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update"
      });
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (FirstName) updateFields.FirstName = FirstName;
    if (LastName) updateFields.LastName = LastName;
    if (Address) updateFields.Address = Address;
    if (MobileNumber) updateFields.MobileNumber = MobileNumber;
    if (Pincode) updateFields.Pincode = Pincode;

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-Password -SetPassword");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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
        Pincode: updatedUser.Pincode
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
