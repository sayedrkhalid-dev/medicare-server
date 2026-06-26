const { status } = require("http-status");

const reviewService = require("./review.service");

const createReview = async (req, res, next) => {
  try {
    const result = await reviewService.createReview(req.user.id, req.body);

    res.status(status.CREATED).json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getDoctorReviews(req.params.doctorId);

    res.status(status.OK).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getMyReviews(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
  getMyReviews,
};
