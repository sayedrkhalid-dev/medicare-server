const { registerUser, loginUser } = require("./auth.service");

// Register controller
const register = async (req, res, next) => {
  const result = await registerUser(req.body);

  res.json(result);
};

// Login controller
const login = async (req, res, next) => {
  const result = await loginUser(req.body);

  res.json(result);
};

module.exports = {
  register,
  login,
};
