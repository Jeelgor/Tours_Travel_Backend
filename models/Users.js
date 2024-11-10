const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UsersSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  SetPassword: {
    type: String,
    required: true,
  },
});

// Pre-save middleware to hash the password and setpassword
UsersSchema.pre("save", async function (next) {
  const user = this;

  // Hash the Password if it is modified
  if (user.isModified("Password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(user.Password, salt);
    } catch (err) {
      return next(err);
    }
  }

  // Hash the SetPassword if it is modified
  if (user.isModified("SetPassword")) {
    try {
      const salt = await bcrypt.genSalt(10);
      user.SetPassword = await bcrypt.hash(user.SetPassword, salt);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// Compare Password method for user instance
UsersSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.Password);
};

// jwt token

UsersSchema.method.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        Email: this.Email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRATE_KEY,
      {
        expiresIn: "30d",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongoose.model("Users", UsersSchema);
