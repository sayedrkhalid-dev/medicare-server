const httpStatus = require("http-status");
const { getAuth } = require("../lib/auth");

const authenticate = async (req, res, next) => {
  try {
    const auth = getAuth();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = authenticate;
