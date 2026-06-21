const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
};
