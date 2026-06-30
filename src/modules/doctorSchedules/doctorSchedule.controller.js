const { status } = require("http-status");

const doctorScheduleService = require("./doctorSchedule.service");

/**
 * Create doctor schedule
 */
const createSchedule = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.createSchedule(
      req.user.id,
      req.body,
    );

    res.status(status.CREATED).json({
      success: true,
      message: "Schedule created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in doctor's schedules
 */
const getMySchedules = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.getMySchedules(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Schedules retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get schedules by doctor id
 */
const getDoctorSchedules = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.getDoctorSchedules(
      req.params.doctorId,
    );

    res.status(status.OK).json({
      success: true,
      message: "Schedules retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor schedule
 */
const updateSchedule = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.updateSchedule(
      req.params.scheduleId,
      req.user.id,
      req.body,
    );

    res.status(status.OK).json({
      success: true,
      message: "Schedule updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate schedule
 */
const activateSchedule = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.activateSchedule(
      req.params.scheduleId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "Schedule activated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate schedule
 */
const deactivateSchedule = async (req, res, next) => {
  try {
    const result = await doctorScheduleService.deactivateSchedule(
      req.params.scheduleId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "Schedule deactivated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete doctor schedule
 */
const deleteSchedule = async (req, res, next) => {
  try {
    await doctorScheduleService.deleteSchedule(
      req.params.scheduleId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSchedule,
  getMySchedules,
  getDoctorSchedules,
  updateSchedule,
  activateSchedule,
  deactivateSchedule,
  deleteSchedule,
};
