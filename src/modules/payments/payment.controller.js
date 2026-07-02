const { status } = require("http-status");
const createHttpError = require("http-errors");

const paymentService = require("./payment.service");

/**
 * Create Stripe Checkout Session
 */
const checkout = async (req, res, next) => {
  try {
    const result = await paymentService.createCheckoutSession(
      req.user.id,
      req.body,
    );

    res.status(status.CREATED).json({
      success: true,
      message: "Checkout session created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe Webhook
 */
const webhook = async (req, res, next) => {
  try {
    await paymentService.handleWebhook(req);

    res.status(status.OK).json({
      received: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Checkout Session
 *
 * Polled by the frontend success page until the webhook has finished
 * creating the Payment + Appointment records.
 */
const verify = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw createHttpError(400, "Session ID is required");
    }

    const result = await paymentService.verifyCheckoutSession(
      sessionId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reconcile a stuck payment (Admin)
 *
 * For payments that ended up "succeeded" with no linked appointment
 * because appointment creation failed after the charge went through.
 */
const reconcile = async (req, res, next) => {
  try {
    const result = await paymentService.reconcilePayment(req.params.id);

    res.status(status.OK).json({
      success: true,
      message: result.alreadyReconciled
        ? "Payment was already reconciled."
        : "Payment reconciled and appointment created.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Payments (Patient)
 */
const getMyPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getMyPayments(req.user.id, req.query);

    res.status(status.OK).json({
      success: true,
      message: "Payments retrieved successfully.",
      data: result.payments,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payment By ID
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(
      req.params.id,
      req.user,
    );

    res.status(status.OK).json({
      success: true,
      message: "Payment retrieved successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Payments (Admin)
 */
const getPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPayments(req.query);

    res.status(status.OK).json({
      success: true,
      message: "Payments retrieved successfully.",
      data: result.payments,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  webhook,
  verify,
  reconcile,
  getMyPayments,
  getPaymentById,
  getPayments,
};
