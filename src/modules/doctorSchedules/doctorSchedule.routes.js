const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const doctorScheduleController = require("./doctorSchedule.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/doctor/:doctorId", doctorScheduleController.getDoctorSchedules);

/*
|--------------------------------------------------------------------------
| Doctor Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/create",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.createSchedule,
);

router.get(
  "/me",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.getMySchedules,
);

router.patch(
  "/:scheduleId",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.updateSchedule,
);

router.patch(
  "/:scheduleId/activate",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.activateSchedule,
);

router.patch(
  "/:scheduleId/deactivate",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.deactivateSchedule,
);

router.delete(
  "/:scheduleId",
  authenticate,
  authorize("doctor"),
  doctorScheduleController.deleteSchedule,
);

module.exports = router;
