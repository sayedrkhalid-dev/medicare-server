const { status } = require("http-status");

const doctorApplicationService = require("./doctorApplication.service");

const createApplication = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.createApplication(
      req.user.id,
      req.body,
    );

    res.status(status.CREATED).json({
      success: true,
      message: "Doctor application submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.getMyApplication(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Applications retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.getAllApplications();

    res.status(status.OK).json({
      success: true,
      message: "Applications retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.getApplicationById(
      req.params.applicationId,
    );

    res.status(status.OK).json({
      success: true,
      message: "Application retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const approveApplication = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.approveApplication(
      req.params.applicationId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "Application approved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const rejectApplication = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.rejectApplication(
      req.params.applicationId,
      req.user.id,
      req.body.rejectionReason,
    );

    res.status(status.OK).json({
      success: true,
      message: "Application rejected successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resubmitApplication = async (req, res, next) => {
  try {
    const result = await doctorApplicationService.resubmitApplication(
      req.params.applicationId,
      req.user.id,
      req.body,
    );

    res.status(status.OK).json({
      success: true,
      message: "Application resubmitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  resubmitApplication,
};
