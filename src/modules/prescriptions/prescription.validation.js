const { z } = require("zod");

const medicineSchema = z.object({
  name: z.string().min(1),

  dosage: z.string().min(1),

  frequency: z.string().min(1),

  duration: z.string().min(1),
});

const createPrescriptionSchema = z.object({
  appointmentId: z.string(),

  diagnosis: z.string().min(1),

  notes: z.string().optional(),

  medicines: z.array(medicineSchema).min(1),
});

module.exports = {
  createPrescriptionSchema,
};
