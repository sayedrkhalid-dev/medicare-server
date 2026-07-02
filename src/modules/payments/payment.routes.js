const express = require("express");

const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");
const validate = require("../../middlewares/validate");

const paymentController = require("./payment.controller");
const { createCheckoutSchema } = require("./payment.validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| NOTE
|--------------------------------------------------------------------------
| The Stripe webhook route is NOT registered here. It's mounted directly
| in app.js at POST /payments/webhook, before express.json() runs, so it
| can receive the raw request body required for signature verification.
*/

/*
|--------------------------------------------------------------------------
| Patient Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/checkout",
  authenticate,
  authorize("patient"),
  validate(createCheckoutSchema),
  paymentController.checkout,
);

router.get(
  "/verify/:sessionId",
  authenticate,
  authorize("patient"),
  paymentController.verify,
);

router.get(
  "/me",
  authenticate,
  authorize("patient"),
  paymentController.getMyPayments,
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/reconcile",
  authenticate,
  authorize("admin"),
  paymentController.reconcile,
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  paymentController.getPayments,
);

/*
|--------------------------------------------------------------------------
| Shared Routes (Patient: own payment only / Admin: any payment)
|--------------------------------------------------------------------------
| NOTE: must come AFTER /me and /:id/reconcile, or Express will treat
| "me"/"<id>/reconcile" segments as being consumed by this looser :id route.
*/

router.get(
  "/:id",
  authenticate,
  authorize("patient", "admin"),
  paymentController.getPaymentById,
);

module.exports = router;
