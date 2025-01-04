const mongoose = require("mongoose");

const connectMongoose = async () => {
  try {
    const DbURI = process.env.MONGO_URI;
    // mongoose.connect("mongodb://localhost:27017/TourAndTravel");
    mongoose.connect(DbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database is connected Succesfully");
  } catch (error) {
    console.log("Error in Establish Database Connection");
  }
};

module.exports = connectMongoose;
