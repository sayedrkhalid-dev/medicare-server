const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Doctor",
    },

    doctorName: {
      type: String,
      required: true,
    },

    doctorSpecialization: {
      type: String,
      required: true,
    },

    consultationFee: {
      type: Number,
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    appointmentStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },

    symptoms: {
      type: String,
      trim: true,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
  appointmentTime: 1,
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
