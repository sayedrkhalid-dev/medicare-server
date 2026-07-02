const { ZodError } = require("zod");
const createHttpError = require("http-errors");

/**
 * Validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (and possibly
 * transformed/coerced) data.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");

      return next(createHttpError(400, message));
    }

    next(error);
  }
};

module.exports = validate;
