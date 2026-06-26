const createHttpError = require("http-errors");
const { ObjectId } = require("mongodb");

const Appointment = require("./appointment.model");

const Doctor = require("../doctors/doctor.model");
const DoctorSchedule = require("../doctorSchedules/doctorSchedule.model");

const { getDB } = require("../../config/db");

const generateTimeSlots = require("../../utils/generateTimeSlots");

/**
 * Get available slots
 */
const getAvailableSlots = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  if (doctor.status !== "approved") {
    throw createHttpError(400, "Doctor is not available");
  }

  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const schedules = await DoctorSchedule.find({
    doctorId: doctor._id,
    dayOfWeek,
    isActive: true,
  });

  if (!schedules.length) {
    return [];
  }

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
    appointmentStatus: {
      $nin: ["cancelled"],
    },
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

  /*
  |--------------------------------------------------------------------------
  | Patient
  |--------------------------------------------------------------------------
  */
  const patient = await db.collection("user").findOne({
    _id: new ObjectId(patientId),
  });

  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Doctor
  |--------------------------------------------------------------------------
  */
  const doctor = await Doctor.findById(payload.doctorId);

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  if (doctor.status !== "approved") {
    throw createHttpError(400, "Doctor is not available");
  }

  /*
  |--------------------------------------------------------------------------
  | Doctor User
  |--------------------------------------------------------------------------
  */
  const doctorUser = await db.collection("user").findOne({
    _id: doctor.userId,
  });

  if (!doctorUser) {
    throw createHttpError(404, "Doctor user not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Available Slots
  |--------------------------------------------------------------------------
  */
  const availableSlots = await getAvailableSlots(
    payload.doctorId,
    payload.appointmentDate,
  );

  if (!availableSlots.includes(payload.appointmentTime)) {
    throw createHttpError(400, "Selected slot is unavailable");
  }

  /*
  |--------------------------------------------------------------------------
  | Create Appointment
  |--------------------------------------------------------------------------
  */
  const appointment = await Appointment.create({
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

  return appointment;
};

/**
 * Get patient appointments
 */
const getMyAppointments = async (patientId) => {
  return Appointment.find({
    patientId,
  }).sort({
    appointmentDate: -1,
    createdAt: -1,
  });
};

/**
 * Get appointment by id
 */
const getAppointmentById = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found");
  }

  return appointment;
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found");
  }

  if (appointment.patientId.toString() !== patientId) {
    throw createHttpError(403, "Forbidden access");
  }

  appointment.appointmentStatus = "cancelled";

  await appointment.save();

  return appointment;
};

module.exports = {
  getAvailableSlots,
  createAppointmentAfterPayment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
};
