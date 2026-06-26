const { status } = require("http-status");

const paymentService = require("./payment.service");

/**
 * Checkout
 */
const checkout = async (req, res, next) => {
  try {
    const result = await paymentService.checkout(req.user.id, req.body);

    res.status(status.CREATED).json({
      success: true,
      message: "Payment completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
};
