const mongoose = require("mongoose");

const {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_CURRENCY,
} = require("./payment.constants");

const paymentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: Object.values(PAYMENT_CURRENCY),
      default: PAYMENT_CURRENCY.BDT,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.STRIPE,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },

    receiptUrl: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paymentSchema.index({
  patientId: 1,
  createdAt: -1,
});

paymentSchema.index({
  doctorId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Payment", paymentSchema);
