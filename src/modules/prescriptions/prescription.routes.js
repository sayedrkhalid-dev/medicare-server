const express = require("express");

const authenticate = require("../../middlewares/authenticate");

const authorize = require("../../middlewares/authorize");

const prescriptionController = require("./prescription.controller");

const router = express.Router();

// Doctor routes
router.post(
  "/",
  authenticate,
  authorize("doctor"),
  prescriptionController.createPrescription,
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

// Admin routes
router.get(
  "/",
  authenticate,
  authorize("admin"),
  prescriptionController.getAllPrescriptions,
);

module.exports = router;
