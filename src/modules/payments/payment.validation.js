const { z } = require("zod");

const createCheckoutSchema = z.object({
  doctorId: z
    .string({
      required_error: "Doctor ID is required",
    })
    .trim()
    .min(1, "Doctor ID is required"),

  appointmentDate: z
    .string({
      required_error: "Appointment date is required",
    })
    .date("Invalid appointment date"),

  appointmentTime: z
    .string({
      required_error: "Appointment time is required",
    })
    .trim()
    .min(1, "Appointment time is required"),

  symptoms: z
    .string()
    .trim()
    .max(1000, "Symptoms cannot exceed 1000 characters")
    .optional(),
});

const verifySessionSchema = z.object({
  sessionId: z
    .string({
      required_error: "Session ID is required",
    })
    .trim()
    .min(1, "Session ID is required"),
});

module.exports = {
  createCheckoutSchema,
  verifySessionSchema,
};
