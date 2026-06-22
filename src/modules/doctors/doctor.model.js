const mongoose = require("mongoose");
const { DOCTOR_STATUS, SPECIALIZATIONS } = require("./doctor.constant");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Application ID is required"],
      unique: true,
    },

    bmdcNumber: {
      type: String,
      required: [true, "BMDC number is required"],
      unique: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      enum: SPECIALIZATIONS,
    },

    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: 0,
    },

    experienceYears: {
      type: Number,
      required: [true, "Experience is required"],
      min: 0,
    },

    languages: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(DOCTOR_STATUS),
      default: DOCTOR_STATUS.APPROVED,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorSchema.index({
  specialization: 1,
});

doctorSchema.index({
  hospital: 1,
});

doctorSchema.index({
  rating: -1,
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
