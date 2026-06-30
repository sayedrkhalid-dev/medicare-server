// Third-party dependencies
const createHttpError = require("http-errors");

// Models
const Doctor = require("../doctors/doctor.model");
const DoctorSchedule = require("./doctorSchedule.model");

// Utilities
const { timeToMinutes } = require("../../utils/time");

/**
 * Create a new schedule block for a doctor
 * Prevents overlapping schedules on the same day
 */
const createSchedule = async (doctorId, payload) => {
  // Verify doctor profile exists
  const doctor = await Doctor.findOne({ userId: doctorId });
  console.log(
    "Doctor :",
    doctor,
    "Doctor ID : ",
    doctorId,
    "Payload data : ",
    payload,
  );

  if (!doctor) {
    throw createHttpError(403, "Doctor profile not found");
  }

  // Convert times into minutes for comparison
  const start = timeToMinutes(payload.startTime);
  const end = timeToMinutes(payload.endTime);

  // Validate time range
  if (start >= end) {
    throw createHttpError(400, "End time must be greater than start time.");
  }

  // Get existing schedules for the same day
  const existingSchedules = await DoctorSchedule.find({
    doctorId: doctor._id,
    dayOfWeek: payload.dayOfWeek,
  });

  // Check overlapping schedules
  for (const schedule of existingSchedules) {
    const existingStart = timeToMinutes(schedule.startTime);

    const existingEnd = timeToMinutes(schedule.endTime);

    const overlaps = start < existingEnd && end > existingStart;

    if (overlaps) {
      throw createHttpError(400, "Schedule overlaps with an existing schedule");
    }
  }

  return DoctorSchedule.create({
    ...payload,
    doctorId: doctor._id,
  });
};

/**
 * Get all schedules of the logged-in doctor
 */
const getMySchedules = async (userId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found");
  }

  return DoctorSchedule.find({
    doctorId: doctor._id,
  }).sort({
    dayOfWeek: 1,
    startTime: 1,
  });
};

/**
 * Get all active schedules of a doctor
 */
const getDoctorSchedules = async (doctorId) => {
  return await DoctorSchedule.find({
    doctorId: doctorId,
    isActive: true,
  }).sort({
    dayOfWeek: 1,
    startTime: 1,
  });
};

/**
 * Update an existing schedule block
 * Re-validates overlap rules
 */
const updateSchedule = async (scheduleId, userId, payload) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found");
  }

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    throw createHttpError(404, "Schedule not found");
  }

  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw createHttpError(403, "Forbidden");
  }

  const updatedDay = payload.dayOfWeek || schedule.dayOfWeek;

  const updatedStart = payload.startTime || schedule.startTime;

  const updatedEnd = payload.endTime || schedule.endTime;

  const start = timeToMinutes(updatedStart);

  const end = timeToMinutes(updatedEnd);

  if (start >= end) {
    throw createHttpError(400, "End time must be greater than start time");
  }

  const existingSchedules = await DoctorSchedule.find({
    doctorId: doctor._id,
    dayOfWeek: updatedDay,
    _id: {
      $ne: scheduleId,
    },
  });

  for (const item of existingSchedules) {
    const existingStart = timeToMinutes(item.startTime);

    const existingEnd = timeToMinutes(item.endTime);

    const overlaps = start < existingEnd && end > existingStart;

    if (overlaps) {
      throw createHttpError(400, "Schedule overlaps with an existing schedule");
    }
  }

  Object.assign(schedule, payload);

  await schedule.save();

  return schedule;
};

/**
 * Enable or disable a schedule block
 */
const toggleScheduleStatus = async (scheduleId, userId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found");
  }

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    throw createHttpError(404, "Schedule not found");
  }

  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw createHttpError(403, "Forbidden");
  }

  schedule.isActive = !schedule.isActive;

  await schedule.save();

  return schedule;
};

/**
 * Permanently delete a schedule block
 */
const deleteSchedule = async (scheduleId, userId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw createHttpError(404, "Doctor profile not found");
  }

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    throw createHttpError(404, "Schedule not found");
  }

  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw createHttpError(403, "Forbidden");
  }

  await DoctorSchedule.findByIdAndDelete(scheduleId);

  return null;
};

const activateSchedule = async (scheduleId, userId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    throw createHttpError(404, "Schedule not found");
  }

  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw createHttpError(403, "Forbidden");
  }

  schedule.isActive = true;

  await schedule.save();

  return schedule;
};

const deactivateSchedule = async (scheduleId, userId) => {
  const doctor = await Doctor.findOne({
    userId,
  });

  const schedule = await DoctorSchedule.findById(scheduleId);

  if (!schedule) {
    throw createHttpError(404, "Schedule not found");
  }

  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw createHttpError(403, "Forbidden");
  }

  schedule.isActive = false;

  await schedule.save();

  return schedule;
};

module.exports = {
  createSchedule,
  getMySchedules,
  getDoctorSchedules,
  updateSchedule,
  toggleScheduleStatus,
  deleteSchedule,
  activateSchedule,
  deactivateSchedule,
};
