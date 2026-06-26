const createHttpError = require("http-errors");

const notFound = (req, res, next) => {
  next(createHttpError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = notFound;
