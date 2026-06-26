const { status } = require("http-status");

const appointmentService = require("./appointment.service");

/**
 * Get available slots
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const result = await appointmentService.getAvailableSlots(
      req.query.doctorId,
      req.query.date,
    );

    res.status(status.OK).json({
      success: true,
      message: "Available slots retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my appointments
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.getMyAppointments(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const result = await appointmentService.getAppointmentById(
      req.params.appointmentId,
    );

    res.status(status.OK).json({
      success: true,
      message: "Appointment retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.cancelAppointment(
      req.params.appointmentId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
};
