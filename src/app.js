// Comment section of the project

// Dependencies
const express = require("express");
const cors = require("cors");

const doctorRoutes = require("./modules/doctors/doctor.routes");
const userRoutes = require("./modules/users/user.routes");
const doctorApplicationRoutes = require("./modules/doctorApplications/doctorApplication.routes");
const doctorScheduleRoutes = require("./modules/doctorSchedules/doctorSchedule.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const prescriptionRoutes = require("./modules/prescriptions/prescription.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const reviewRoutes = require("./modules/reviews/review.routes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

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
app.use("/users", userRoutes);
app.use("/doctors", doctorRoutes);
app.use("/doctor-applications", doctorApplicationRoutes);
app.use("/doctor-schedules", doctorScheduleRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/payments", paymentRoutes);
app.use("/reviews", reviewRoutes);

// app.use(notFound);
app.use(errorHandler);

module.exports = app;
