const { z } = require("zod");

const createDoctorScheduleSchema = z.object({
  dayOfWeek: z.enum([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]),

  startTime: z.string(),

  endTime: z.string(),

  slotDuration: z.enum(["15", "30", "45", "60"]).transform(Number),
});

const updateDoctorScheduleSchema = createDoctorScheduleSchema.partial();

module.exports = {
  createDoctorScheduleSchema,
  updateDoctorScheduleSchema,
};
