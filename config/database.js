const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectMongoose = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const DbURI = process.env.MONGO_URI;
  if (!DbURI) {
    console.warn("MONGO_URI not provided in environment variables.");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 7000,
    };

    cached.promise = mongoose
      .connect(DbURI, opts)
      .then((m) => {
        console.log("Database connected successfully");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("Error in Establish Database Connection:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectMongoose;
