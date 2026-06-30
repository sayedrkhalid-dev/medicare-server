const express = require("express");

const authenticate = require("../../middlewares/authenticate");

const authorize = require("../../middlewares/authorize");

const prescriptionController = require("./prescription.controller");

const router = express.Router();

// Admin routes
router.get(
  "/all",
  authenticate,
  authorize("admin"),
  prescriptionController.getAllPrescriptions,
);

// Patient routes
router.get(
  "/me",
  authenticate,
  authorize("patient"),
  prescriptionController.getMyPrescriptions,
);

// Shared routes
router.get(
  "/:prescriptionId",
  authenticate,
  prescriptionController.getPrescriptionById,
);

// Doctor routes
router.post(
  "/",
  authenticate,
  authorize("doctor"),
  prescriptionController.createPrescription,
);

module.exports = router;
