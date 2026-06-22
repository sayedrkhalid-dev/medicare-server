const { z } = require("zod");

const createDoctorApplicationSchema = z.object({
  bmdcNumber: z.string().min(1, "BMDC number is required"),

  bmdcCertificateUrl: z.string().url("Valid certificate URL is required"),

  specialization: z.string().min(1),

  hospital: z.string().min(1),

  consultationFee: z.number().min(0),

  experienceYears: z.number().min(0),

  languages: z.array(z.string()).optional(),

  bio: z.string().max(1000).optional(),
});

const rejectDoctorApplicationSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

const resubmitDoctorApplicationSchema = createDoctorApplicationSchema;

module.exports = {
  createDoctorApplicationSchema,
  rejectDoctorApplicationSchema,
  resubmitDoctorApplicationSchema,
};
