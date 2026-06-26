const express = require("express");

const authenticate = require("../../middlewares/authenticate");

const authorize = require("../../middlewares/authorize");

const reviewController = require("./review.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.get("/doctor/:doctorId", reviewController.getDoctorReviews);

/*
|--------------------------------------------------------------------------
| Patient
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("patient"),
  reviewController.createReview,
);

router.get(
  "/me",
  authenticate,
  authorize("patient"),
  reviewController.getMyReviews,
);

module.exports = router;
