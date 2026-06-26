const { z } = require("zod");

const createPaymentSchema = z.object({
  doctorId: z.string(),

  appointmentDate: z.string(),

  appointmentTime: z.string(),

  symptoms: z.string().optional(),
});

module.exports = {
  createPaymentSchema,
};
