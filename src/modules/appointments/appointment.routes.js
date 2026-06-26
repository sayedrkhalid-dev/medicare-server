const express = require("express");

const appointmentController = require("./appointment.controller");
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/available-slots", appointmentController.getAvailableSlots);

/*
|--------------------------------------------------------------------------
| Private Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authenticate,
  authorize("patient"),
  appointmentController.getMyAppointments,
);

router.get(
  "/:appointmentId",
  authenticate,
  appointmentController.getAppointmentById,
);

router.patch(
  "/:appointmentId/cancel",
  authenticate,
  authorize("patient"),
  appointmentController.cancelAppointment,
);

module.exports = router;
