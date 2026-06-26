const { z } = require("zod");

const createReviewSchema = z.object({
  appointmentId: z.string(),

  rating: z.number().min(1).max(5),

  comment: z.string().max(1000).optional(),
});

module.exports = {
  createReviewSchema,
};
