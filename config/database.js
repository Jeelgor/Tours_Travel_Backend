const mongoose = require("mongoose");

const connectMongoose = async () => {
  try {
    mongoose.connect("mongodb://localhost:27017/TourAndTravel");
    console.log("Database is connected Succesfully");
  } catch (error) {
    console.log("Error in Establish Database Connection");
  }
};

module.exports = connectMongoose;
