import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth.schema";

export const freeBookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().min(5).max(20),
});

export type FreeBookingInput = z.infer<typeof freeBookingSchema>;
