const { z } = require("zod");

const updateDoctorStatusSchema = z.object({
  status: z.enum(["approved", "suspended"]),
});

const getDoctorsQuerySchema = z.object({
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  minFee: z.coerce.number().optional(),
  maxFee: z.coerce.number().optional(),
  searchTerm: z.string().optional(),
});

module.exports = {
  updateDoctorStatusSchema,
  getDoctorsQuerySchema,
};
