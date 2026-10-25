const Users = require("../../models/Users");
const OTP = require("../../models/OtpModel");
const sendotp = require("../../Utility/SendOptMailer");
const bcrypt = require("bcrypt");
const { genrateToken } = require("../../middleware/authMiddleware");

// Register Admin
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
    let user = await Users.findOne({ Email });
    if (user) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    user = new Users({
      FirstName,
      LastName,
      Email,
      Password,
      SetPassword,
      Pincode,
      MobileNumber,
      Address,
      role: "admin",
    });

    const response = await user.save();
    const token = genrateToken({ id: response._id, Email: response.Email, role: "admin" });

    res.status(200).json({
      msg: "Admin Registered Successfully",
      response,
      token,
    });
  } catch (error) {
    console.error("Error in RegisterUser (Admin):", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Login Admin
exports.LoginUser = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const user = await Users.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await OTP.deleteMany({ Email });
    await new OTP({ Email, otp, expiresAt: Date.now() + 300000 }).save();

    console.log(`Generated Admin OTP for ${Email}: ${otp}`);
    sendotp(Email, otp).catch((err) => console.error("OTP email send failed:", err));

    res.status(200).json({
      message: "OTP sent to your email. Please verify OTP to complete login.",
      requireOtp: true,
      Email: user.Email,
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Error logging in user", error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { otp, Email } = req.body;

  try {
    const query = Email ? { otp, Email } : { otp };
    const otpDoc = await OTP.findOne(query);
    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpDoc.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    const user = await Users.findOne({ Email: otpDoc.Email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await OTP.deleteOne({ _id: otpDoc._id });
    const token = genrateToken({ id: user._id, Email: user.Email, role: user.role || "admin" });

    res.status(200).json({
      message: "OTP verified successfully. Login complete.",
      token,
      user: {
        id: user._id,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        role: user.role,
      },
    });
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
    const user = await Users.findById(req.user.id).select("-Password -SetPassword");
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
    const userId = req.user.id;
    const { FirstName, LastName, Address, MobileNumber, Pincode } = req.body;

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
      return res.status(404).json({ success: false, message: "User not found" });
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
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
