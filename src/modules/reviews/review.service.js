const createHttpError = require("http-errors");

const { getDB } = require("../../config/db");

const Review = require("./review.model");

const Doctor = require("../doctors/doctor.model");

const Appointment = require("../appointments/appointment.model");

/**
 * Create review
 */
const createReview = async (patientId, payload) => {
  const db = getDB();

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
  | Ownership
  |--------------------------------------------------------------------------
  */
  if (appointment.patientId.toString() !== patientId) {
    throw createHttpError(403, "Forbidden access");
  }

  /*
  |--------------------------------------------------------------------------
  | Completed appointment only
  |--------------------------------------------------------------------------
  */
  if (appointment.appointmentStatus !== "completed") {
    throw createHttpError(
      400,
      "Review can only be submitted after consultation",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Existing review
  |--------------------------------------------------------------------------
  */
  const existingReview = await Review.findOne({
    appointmentId: appointment._id,
  });

  if (existingReview) {
    throw createHttpError(409, "Review already submitted");
  }

  /*
  |--------------------------------------------------------------------------
  | Patient
  |--------------------------------------------------------------------------
  */
  const patient = await db.collection("user").findOne({
    _id: appointment.patientId,
  });

  if (!patient) {
    throw createHttpError(404, "Patient not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Doctor
  |--------------------------------------------------------------------------
  */
  const doctor = await Doctor.findById(appointment.doctorId);

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Create Review
  |--------------------------------------------------------------------------
  */
  const review = await Review.create({
    appointmentId: appointment._id,

    patientId: appointment.patientId,

    patientName: patient.name,

    doctorId: appointment.doctorId,

    rating: payload.rating,

    comment: payload.comment || "",
  });

  /*
  |--------------------------------------------------------------------------
  | Update Doctor Rating
  |--------------------------------------------------------------------------
  */
  const reviews = await Review.find({
    doctorId: doctor._id,
  });

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  doctor.reviewCount = reviews.length;

  doctor.rating = Number((totalRating / reviews.length).toFixed(1));

  await doctor.save();

  return review;
};

/**
 * Get doctor reviews
 */
const getDoctorReviews = async (doctorId) => {
  return Review.find({
    doctorId,
  }).sort({
    createdAt: -1,
  });
};

/**
 * Get patient reviews
 */
const getMyReviews = async (patientId) => {
  return Review.find({
    patientId,
  }).sort({
    createdAt: -1,
  });
};

module.exports = {
  createReview,
  getDoctorReviews,
  getMyReviews,
};
