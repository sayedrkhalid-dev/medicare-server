// Comment section of the project

// Dependencies
const express = require("express");
const cors = require("cors");

// Module scuffolding - (App object)
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuration object of the app - (config object)
const config = {};

// Function declarations

// All function invocations - (All routes)

// Helth check route
app.get("/", (req, res) => {
  res.send("Hello developers");
});

module.exports = app;
