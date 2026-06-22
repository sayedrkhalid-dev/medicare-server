const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

const doctorApplicationController = require("./doctorApplication.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Doctor Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("doctor"),
  doctorApplicationController.createApplication,
);

router.get(
  "/me",
  authenticate,
  authorize("doctor"),
  doctorApplicationController.getMyApplications,
);

router.patch(
  "/:applicationId/resubmit",
  authenticate,
  authorize("doctor"),
  doctorApplicationController.resubmitApplication,
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticate,
  authorize("admin"),
  doctorApplicationController.getAllApplications,
);

router.get(
  "/:applicationId",
  authenticate,
  authorize("admin"),
  doctorApplicationController.getApplicationById,
);

router.patch(
  "/:applicationId/approve",
  authenticate,
  authorize("admin"),
  doctorApplicationController.approveApplication,
);

router.patch(
  "/:applicationId/reject",
  authenticate,
  authorize("admin"),
  doctorApplicationController.rejectApplication,
);

module.exports = router;
