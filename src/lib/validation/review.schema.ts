import { z } from "zod";

export const reviewSchema = z.object({
  name: z.string().trim().min(2).max(100),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
