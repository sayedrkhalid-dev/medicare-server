const { status } = require("http-status");

const doctorService = require("./doctor.services");

const getAllDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.getAllDoctors(req.query);

    res.status(status.OK).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const result = await doctorService.getDoctorById(doctorId);

    res.status(status.OK).json({
      success: true,
      message: "Doctor retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyDoctorProfile = async (req, res, next) => {
  try {
    const result = await doctorService.getDoctorProfileByUserId(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Doctor profile retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const suspendDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const result = await doctorService.suspendDoctor(doctorId);

    res.status(status.OK).json({
      success: true,
      message: "Doctor suspended successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const activateDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const result = await doctorService.activateDoctor(doctorId);

    res.status(status.OK).json({
      success: true,
      message: "Doctor activated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  suspendDoctor,
  activateDoctor,
};
