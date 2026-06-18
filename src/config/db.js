const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("Succesfully connected the MongoDB database.");
  } catch (error) {
    console.error("Database connection failed!", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
