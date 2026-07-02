const createHttpError = require("http-errors");

const Prescription = require("./prescription.model");

const Appointment = require("../appointments/appointment.model");

const Doctor = require("../doctors/doctor.model");

/**
 * Create prescription
 */
const createPrescription = async (doctorUserId, payload) => {
  /*
  |--------------------------------------------------------------------------
  | Appointment
  |--------------------------------------------------------------------------
  */
  const appointment = await Appointment.findById(payload.appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Appointment must be completed
  |--------------------------------------------------------------------------
  */
  if (appointment.appointmentStatus !== "completed") {
    throw createHttpError(
      400,
      "Prescription can only be created for completed appointments",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Doctor
  |--------------------------------------------------------------------------
  */
  const doctor = await Doctor.findOne({
    userId: doctorUserId,
  });

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Ownership check
  |--------------------------------------------------------------------------
  */
  if (doctor._id.toString() !== appointment.doctorId.toString()) {
    throw createHttpError(403, "Forbidden access");
  }

  /*
  |--------------------------------------------------------------------------
  | Existing prescription
  |--------------------------------------------------------------------------
  */
  const existing = await Prescription.findOne({
    appointmentId: appointment._id,
  });

  if (existing) {
    throw createHttpError(409, "Prescription already exists");
  }

  /*
  |--------------------------------------------------------------------------
  | Create prescription
  |--------------------------------------------------------------------------
  */
  const prescription = await Prescription.create({
    appointmentId: appointment._id,

    patientId: appointment.patientId,

    patientName: appointment.patientName,

    doctorId: appointment.doctorId,

    doctorName: appointment.doctorName,

    doctorSpecialization: appointment.doctorSpecialization,

    diagnosis: payload.diagnosis,

    notes: payload.notes || "",

    medicines: payload.medicines,
  });

  return prescription;
};

/**
 * Patient prescriptions
 */
const getMyPrescriptions = async (patientId) => {
  const prescriptions = await Prescription.find({
    patientId,
  }).sort({
    createdAt: -1,
  });

  if (!prescriptions) {
    throw createHttpError(404, "Prescription not found");
  }

  return prescriptions;
};

/**
 * Get prescription by id
 */
const getPrescriptionById = async (prescriptionId) => {
  const prescription = await Prescription.findById(prescriptionId);

  if (!prescription) {
    throw createHttpError(404, "Prescription not found");
  }

  return prescription;
};

/**
 * Admin prescriptions
 */
const getAllPrescriptions = async () => {
  return Prescription.find().sort({
    createdAt: -1,
  });
};

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getAllPrescriptions,
};
