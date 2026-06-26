const { status } = require("http-status");

const userService = require("./user.service");

/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
  try {
    const result = await userService.getMe(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);

    res.status(status.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const result = await userService.getAllUsers(
      page,
      limit,
      req.query.search,
      req.query.role,
      req.query.status,
    );

    res.status(status.OK).json({
      success: true,
      message: "Users retrieved successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by id
 */
const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.userId);

    res.status(status.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend user
 */
const suspendUser = async (req, res, next) => {
  try {
    const result = await userService.suspendUser(
      req.params.userId,
      req.user.id,
    );

    res.status(status.OK).json({
      success: true,
      message: "User suspended successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user
 */
const activateUser = async (req, res, next) => {
  try {
    const result = await userService.activateUser(req.params.userId);

    res.status(status.OK).json({
      success: true,
      message: "User activated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
};
