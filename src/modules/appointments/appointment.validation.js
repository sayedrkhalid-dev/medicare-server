const { z } = require("zod");

const createAppointmentSchema = z.object({
  doctorId: z.string(),

  appointmentDate: z.string(),

  appointmentTime: z.string(),

  symptoms: z.string().max(1000).optional(),
});

module.exports = {
  createAppointmentSchema,
};
