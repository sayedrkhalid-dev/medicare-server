const express = require("express");

const authenticate = require("../../middlewares/authenticate");

const authorize = require("../../middlewares/authorize");

const paymentController = require("./payment.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Patient Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/checkout",
  authenticate,
  authorize("patient"),
  paymentController.checkout,
);

module.exports = router;
