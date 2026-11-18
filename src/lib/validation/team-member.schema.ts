import { z } from "zod";

export const teamMemberFormSchema = z.object({
  nameEn: z.string().trim().min(1).max(100),
  nameAr: z.string().trim().min(1).max(100),
  sortOrder: z.coerce.number().int().min(0).default(0),
  photoMediaId: z
    .string()
    .trim()
    .transform((v) => (v.length > 0 ? v : undefined))
    .optional(),
});

export type TeamMemberFormInput = z.infer<typeof teamMemberFormSchema>;
