const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const doctorController = require("./doctor.controllers");

const router = express.Router();

// Public
router.get("/doctors", doctorController.getAllDoctors);

router.get("/doctors/:doctorId", doctorController.getDoctorById);

// Doctor
router.get(
  "/me/profile",
  authenticate,
  authorize("doctor"),
  doctorController.getMyDoctorProfile,
);

// Admin
router.patch(
  "/:doctorId/suspend",
  authenticate,
  authorize("admin"),
  doctorController.suspendDoctor,
);

router.patch(
  "/:doctorId/activate",
  authenticate,
  authorize("admin"),
  doctorController.activateDoctor,
);

module.exports = router;
