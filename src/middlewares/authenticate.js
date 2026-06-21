const { auth } = require("../lib/auth");

const authenticate = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers });
  console.log(session);
  next();
};

module.exports = authenticate;
