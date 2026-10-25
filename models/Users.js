const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsersSchema = new mongoose.Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  SetPassword: { type: String },
  Address: { type: String },
  MobileNumber: { type: String },
  Pincode: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

UsersSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
  }
  if (this.isModified("SetPassword") && this.SetPassword) {
    const salt = await bcrypt.genSalt(10);
    this.SetPassword = await bcrypt.hash(this.SetPassword, salt);
  }
  next();
});

module.exports = mongoose.model("Users", UsersSchema);
