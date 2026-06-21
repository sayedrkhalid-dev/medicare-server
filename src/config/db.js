const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

let dbInstance;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    dbInstance = conn.connection.db;

    console.log("Successfully connected MongoDB");
  } catch (error) {
    console.error("Database connection failed!", error.message);
    process.exit(1);
  }
};

const getDB = () => dbInstance;

module.exports = { connectDB, getDB };
