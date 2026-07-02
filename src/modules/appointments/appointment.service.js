// appointment.service.js

const createHttpError = require("http-errors");
const { ObjectId } = require("mongodb");
const Appointment = require("./appointment.model");
const Doctor = require("../doctors/doctor.model");
const DoctorSchedule = require("../doctorSchedules/doctorSchedule.model");
const { getDB } = require("../../config/db");
const generateTimeSlots = require("../../utils/generateTimeSlots");

const attachUser = async (appointment) => {
  const db = getDB();

  // If appointment is parsed from lean mongoose objects or model instances
  const aptObj = appointment.toObject ? appointment.toObject() : appointment;

  if (!aptObj.patientId) return { ...aptObj, patient: null };

  try {
    const patientUser = await db.collection("user").findOne({
      _id: new ObjectId(aptObj.patientId),
    });

    return {
      ...aptObj,
      patient: patientUser
        ? { name: patientUser.name, email: patientUser.email }
        : null,
    };
  } catch (error) {
    console.error(
      `Error fetching patient user details for appointment ${aptObj._id}:`,
      error,
    );
    return { ...aptObj, patient: null };
  }
};

/**
 * Get available slots
 */
const getAvailableSlots = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw createHttpError(404, "Doctor not found");
  if (doctor.status !== "approved")
    throw createHttpError(400, "Doctor is not available");

  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const schedules = await DoctorSchedule.find({
    doctorId: doctor._id,
    dayOfWeek,
    isActive: true,
  });
  if (!schedules.length) return [];

  const allSlots = [];
  for (const schedule of schedules) {
    const slots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration,
    );
    allSlots.push(...slots);
  }

  const appointments = await Appointment.find({
    doctorId: doctor._id,
    appointmentDate: new Date(date),
    appointmentStatus: { $nin: ["cancelled"] },
  });

  const bookedSlots = appointments.map(
    (appointment) => appointment.appointmentTime,
  );
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
};

/**
 * Create appointment after successful payment
 */
const createAppointmentAfterPayment = async (patientId, paymentId, payload) => {
  const db = getDB();
  const patient = await db
    .collection("user")
    .findOne({ _id: new ObjectId(patientId) });
  if (!patient) throw createHttpError(404, "Patient not found");

  const doctor = await Doctor.findById(payload.doctorId);
  if (!doctor) throw createHttpError(404, "Doctor not found");
  if (doctor.status !== "approved")
    throw createHttpError(400, "Doctor is not available");

  const doctorUser = await db
    .collection("user")
    .findOne({ _id: doctor.userId });
  if (!doctorUser) throw createHttpError(404, "Doctor user not found");

  const availableSlots = await getAvailableSlots(
    payload.doctorId,
    payload.appointmentDate,
  );
  if (!availableSlots.includes(payload.appointmentTime)) {
    throw createHttpError(400, "Selected slot is unavailable");
  }

  return await Appointment.create({
    patientId,
    patientName: patient.name,
    doctorId: doctor._id,
    doctorName: doctorUser.name,
    doctorSpecialization: doctor.specialization,
    consultationFee: doctor.consultationFee,
    paymentId,
    appointmentDate: new Date(payload.appointmentDate),
    appointmentTime: payload.appointmentTime,
    symptoms: payload.symptoms || "",
    appointmentStatus: "pending",
    paymentStatus: "paid",
  });
};

/**
 * Get patient appointments
 */
const getPatientAppointments = async (patientId) => {
  return Appointment.find({ patientId }).sort({
    appointmentDate: -1,
    createdAt: -1,
  });
};

/**
 * FIXED: Query by doctorId instead of nonexistent userId
 */
const getDoctorAppointments = async (doctorId) => {
  return Appointment.find({ doctorId }).sort({
    appointmentDate: -1,
    createdAt: -1,
  });
};

/**
 * ENHANCED: Support dynamic pagination filters matching frontend structural requirements
 */
const getAllAppointments = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 5;
  const skip = (page - 1) * limit;

  const filters = {};

  // Map frontend Tab strings to backend structural values
  if (query.status) {
    if (query.status === "Scheduled") {
      filters.appointmentStatus = { $in: ["pending", "confirmed"] };
    } else if (query.status === "Completed") {
      filters.appointmentStatus = "completed";
    } else if (query.status === "Cancelled") {
      filters.appointmentStatus = "cancelled";
    }
  }

  // Basic Text Search Implementation
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filters.$or = [
      { patientName: searchRegex },
      { doctorName: searchRegex },
      { doctorSpecialization: searchRegex },
    ];
    if (ObjectId.isValid(query.search)) {
      filters.$or.push({ _id: new ObjectId(query.search) });
    }
  }

  const total = await Appointment.countDocuments(filters);
  const totalPages = Math.ceil(total / limit);

  const appointments = await Appointment.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const entriesWithUsers = await Promise.all(appointments.map(attachUser));

  return {
    data: entriesWithUsers,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get appointment by id
 */
const getAppointmentById = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw createHttpError(404, "Appointment not found");
  return appointment;
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw createHttpError(404, "Appointment not found");

  // Optional Check depending on if Admin cancels or Patient cancels
  if (patientId && appointment.patientId.toString() !== patientId.toString()) {
    throw createHttpError(403, "Forbidden access");
  }

  appointment.appointmentStatus = "cancelled";
  await appointment.save();
  return appointment;
};

module.exports = {
  getAvailableSlots,
  createAppointmentAfterPayment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
};
