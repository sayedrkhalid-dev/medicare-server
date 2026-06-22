const httpStatus = require("http-status");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Forbidden access",
      });
    }

    next();
  };
};

module.exports = authorize;
