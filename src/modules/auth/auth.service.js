const User = require("./auth.model");
const bcrypt = require("bcrypt");

// Register user
const registerUser = async (payload) => {
  // Descructure data
  const { email, password } = payload;

  // Find user from database with email
  const existingUser = await User.findOne({ email });

  // Check if the user already exist
  if (existingUser) {
    throw new Error("User already exists!");
  }

  // Hash password
  const hashedPassword = bcrypt.hash(password, 10);
  payload.password = hashedPassword;

  // Create user
  const user = await User.create(payload);

  return user;
};

// Login user
const loginUser = async (payload) => {
  // Destructure data
  const { email, password } = payload;

  // Find user from database
  const user = await User.find({ email });

  // Check if the exist
  if (!user) {
    throw new Error("User not found! Please Register.");
  }

  // Check if the user account is blocked
  if (user.status === "blocked") {
    throw new Error("Account is blocked!");
  }

  // Compare hashed password
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  // Check if the hashed password is not matched
  if (!isPasswordMatched) {
    throw new Error("Invalid credentials!");
  }

  return user;
};

// Forgot password
const forgotPassword = async () => {};

module.exports = {
  registerUser,
  loginUser,
};
