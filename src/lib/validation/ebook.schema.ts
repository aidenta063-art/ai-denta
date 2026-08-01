import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth.schema";

export const ebookOrderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(20),
  email: emailSchema,
});

export type EbookOrderInput = z.infer<typeof ebookOrderSchema>;
