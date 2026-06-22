// Comment section of the project

// Dependencies
const express = require("express");
const cors = require("cors");

const doctorRoutes = require("./modules/doctors/doctor.routes");

// Module scuffolding - (App object)
const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration object of the app - (config object)
const config = {};

// Function declarations

// Helth check route
app.get("/", (req, res) => {
  res.send("Hello developers");
});

// All function invocations - (All routes)
app.use("/", doctorRoutes);

module.exports = app;
