const { register, login } = require("./auth.service");

// Register controller
const registerUser = async (req, res, next) => {
  const result = await register(req.body);

  res.json(result);
};

// Login controller
const loginUser = async (req, res, next) => {
  const result = await login(req.body);

  res.json(result);
};

module.exports = {
  registerUser,
  loginUser,
};
