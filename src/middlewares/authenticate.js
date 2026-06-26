const { status } = require("http-status");
const { getAuth } = require("../lib/auth");

const authenticate = async (req, res, next) => {
  try {
    const auth = getAuth();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(status.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (session.user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    return res.status(status.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = authenticate;
