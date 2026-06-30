const createHttpError = require("http-errors");

const { ObjectId } = require("mongodb");
const { getDB } = require("../../config/db");

const DoctorApplication = require("./doctorApplication.model");
const Doctor = require("../doctors/doctor.model");

const attachUser = async (application) => {
  const db = getDB();

  const user = await db.collection("user").findOne({
    _id: application.userId,
  });

  return {
    ...application.toObject(),
    user,
  };
};

const createApplication = async (userId, payload) => {
  const existingPendingApplication = await DoctorApplication.findOne({
    userId,
    status: "pending",
  });

  if (existingPendingApplication) {
    throw createHttpError(400, "You already have a pending application");
  }

  const existingDoctor = await Doctor.findOne({
    userId,
  });

  if (existingDoctor) {
    throw createHttpError(400, "Doctor profile already exists");
  }

  const application = await DoctorApplication.create({
    ...payload,
    userId,
  });

  return application;
};

const getMyApplication = async (userId) => {
  return DoctorApplication.find({
    userId,
  }).sort({
    createdAt: -1,
  });
};

const getAllApplications = async () => {
  const applications = await DoctorApplication.find().sort({
    createdAt: -1,
  });

  return Promise.all(applications.map(attachUser));
};

const getApplicationById = async (applicationId) => {
  const application = await DoctorApplication.findById(applicationId);

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  return attachUser(application);
};

const approveApplication = async (applicationId, adminId) => {
  const application = await DoctorApplication.findById(applicationId);

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  const existingDoctor = await Doctor.findOne({
    userId: application.userId,
  });

  if (application.status === "approved") {
    throw createHttpError(400, "Application already approved");
  }

  if (existingDoctor) {
    throw createHttpError(400, "Doctor profile already exists");
  }

  if (application.status !== "pending") {
    throw createHttpError(400, "Only pending applications can be approved");
  }

  await Doctor.create({
    userId: application.userId,

    applicationId: application._id,

    bmdcNumber: application.bmdcNumber,

    specialization: application.specialization,

    hospital: application.hospital,

    consultationFee: application.consultationFee,

    experienceYears: application.experienceYears,

    languages: application.languages,

    bio: application.bio,
  });

  application.status = "approved";

  application.reviewedBy = adminId;

  application.reviewedAt = new Date();

  application.rejectionReason = null;

  await application.save();

  return application;
};

const rejectApplication = async (applicationId, adminId, rejectionReason) => {
  const application = await DoctorApplication.findById(applicationId);

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  if (application.status !== "pending") {
    throw createHttpError(400, "Only pending applications can be rejected");
  }

  application.status = "rejected";

  application.reviewedBy = adminId;

  application.reviewedAt = new Date();

  application.rejectionReason = rejectionReason;

  await application.save();

  return application;
};

const resubmitApplication = async (applicationId, userId, payload) => {
  const application = await DoctorApplication.findById(applicationId);

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  if (application.userId.toString() !== userId) {
    throw createHttpError(403, "Forbidden");
  }

  if (application.status !== "rejected") {
    throw createHttpError(400, "Only rejected applications can be resubmitted");
  }

  Object.assign(application, payload);

  application.status = "pending";

  application.reviewedBy = null;

  application.reviewedAt = null;

  application.rejectionReason = null;

  await application.save();

  return application;
};

module.exports = {
  createApplication,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  resubmitApplication,
};
