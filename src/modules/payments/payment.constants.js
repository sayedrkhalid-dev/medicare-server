const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const PAYMENT_METHOD = {
  STRIPE: "stripe",
};

const PAYMENT_CURRENCY = {
  BDT: "bdt",
};

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_CURRENCY,
};
