const { status } = require("http-status");

const prescriptionService = require("./prescription.service");

/**
 * Create prescription
 */
const createPrescription = async (req, res, next) => {
  try {
    const result = await prescriptionService.createPrescription(
      req.user.id,
      req.body,
    );

    res.status(status.CREATED).json({
      success: true,
      message: "Prescription created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my prescriptions
 */
const getMyPrescriptions = async (req, res, next) => {
  try {
    const result = await prescriptionService.getMyPrescriptions(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Prescriptions retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prescription by id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const result = await prescriptionService.getPrescriptionById(
      req.params.prescriptionId,
    );

    res.status(status.OK).json({
      success: true,
      message: "Prescription retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all prescriptions
 */
const getAllPrescriptions = async (req, res, next) => {
  try {
    const result = await prescriptionService.getAllPrescriptions();

    res.status(status.OK).json({
      success: true,
      message: "Prescriptions retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getAllPrescriptions,
};
