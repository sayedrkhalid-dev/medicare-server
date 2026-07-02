const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const doctorScheduleController = require("./doctorSchedule.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Doctor Routes (must come before dynamic /:doctorId route below)
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

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/:doctorId", doctorScheduleController.getDoctorSchedules);

/*
|--------------------------------------------------------------------------
| Doctor Routes (continued — these use /:scheduleId, not /:doctorId,
| so they don't collide with /me, but keep them below /:doctorId is fine
| since /:scheduleId only matches PATCH/DELETE, different methods+paths)
|--------------------------------------------------------------------------
*/

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
