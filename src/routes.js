// routes.js
const doctorRoutes = require("./modules/doctors/doctor.routes");
const userRoutes = require("./modules/users/user.routes");
const doctorApplicationRoutes = require("./modules/doctorApplications/doctorApplication.routes");
const doctorScheduleRoutes = require("./modules/doctorSchedules/doctorSchedule.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const prescriptionRoutes = require("./modules/prescriptions/prescription.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const reviewRoutes = require("./modules/reviews/review.routes");

const errorHandler = require("./middlewares/errorHandler");

module.exports = (app) => {
  // Helth check route
  app.get("/", (req, res) => {
    res.send("Hello developers");
  });

  // All routes
  app.use("/users", userRoutes);
  app.use("/doctors", doctorRoutes);
  app.use("/doctor-applications", doctorApplicationRoutes);
  app.use("/doctor-schedules", doctorScheduleRoutes);
  app.use("/appointments", appointmentRoutes);
  app.use("/prescriptions", prescriptionRoutes);
  app.use("/payments", paymentRoutes);
  app.use("/reviews", reviewRoutes);

  // Global error handler
  app.use(errorHandler);
};
