const mongoose = require("mongoose");
const { DAYS_OF_WEEK } = require("./doctorSchedule.constants");

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },

    dayOfWeek: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: [true, "Day of week is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },

    slotDuration: {
      type: Number,
      required: [true, "Slot duration is required"],
      enum: [15, 30, 45, 60],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);

module.exports = DoctorSchedule;
