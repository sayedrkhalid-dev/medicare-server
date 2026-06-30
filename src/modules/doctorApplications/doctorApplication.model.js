const mongoose = require("mongoose");
const { APPLICATION_STATUS } = require("./doctorApplication.constants");

const doctorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
    },

    bmdcNumber: {
      type: String,
      required: [true, "BMDC number is required"],
      trim: true,
    },

    bmdcCertificateUrl: {
      type: String,
      required: [true, "BMDC certificate is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
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

    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorApplicationSchema.index(
  {
    userId: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  },
);

const DoctorApplication = mongoose.model(
  "DoctorApplication",
  doctorApplicationSchema,
);

module.exports = DoctorApplication;
