const createHttpError = require("http-errors");

const Payment = require("./payment.model");

const Doctor = require("../doctors/doctor.model");

const Appointment = require("../appointments/appointment.model");

const appointmentService = require("../appointments/appointment.service");

/**
 * Checkout and create appointment
 */
const checkout = async (patientId, payload) => {
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
  | Duplicate booking check
  |--------------------------------------------------------------------------
  */
  const existingAppointment = await Appointment.findOne({
    patientId,
    doctorId: doctor._id,
    appointmentDate: new Date(payload.appointmentDate),
    appointmentTime: payload.appointmentTime,
    appointmentStatus: {
      $nin: ["cancelled"],
    },
  });

  if (existingAppointment) {
    throw createHttpError(409, "You already booked this appointment");
  }

  /*
  |--------------------------------------------------------------------------
  | Transaction
  |--------------------------------------------------------------------------
  */
  const transactionId = `TXN-${Date.now()}`;

  /*
  |--------------------------------------------------------------------------
  | Payment
  |--------------------------------------------------------------------------
  */
  const payment = await Payment.create({
    patientId,

    doctorId: doctor._id,

    amount: doctor.consultationFee,

    currency: "BDT",

    transactionId,

    status: "paid",

    appointmentDate: payload.appointmentDate,

    appointmentTime: payload.appointmentTime,
  });

  /*
  |--------------------------------------------------------------------------
  | Appointment
  |--------------------------------------------------------------------------
  */
  const appointment = await appointmentService.createAppointmentAfterPayment(
    patientId,
    payment._id,
    payload,
  );

  /*
  |--------------------------------------------------------------------------
  | Link payment
  |--------------------------------------------------------------------------
  */
  payment.appointmentId = appointment._id;

  await payment.save();

  return {
    payment,
    appointment,
  };
};
