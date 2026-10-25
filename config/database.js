const mongoose = require("mongoose");

const connectMongoose = async () => {
  try {
    const DbURI = process.env.MONGO_URI;
    if (!DbURI) {
      console.warn("MONGO_URI not provided in environment variables.");
      return;
    }
    await mongoose.connect(DbURI);
    console.log("Database is connected Successfully");
  } catch (error) {
    console.error("Error in Establish Database Connection:", error);
  }
};

module.exports = connectMongoose;
