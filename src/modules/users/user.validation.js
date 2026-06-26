const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  image: z.string().url().optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  phone: z.string().max(20).optional(),

  address: z.string().max(500).optional(),

  dateOfBirth: z.string().optional(),
});

module.exports = {
  updateProfileSchema,
};
