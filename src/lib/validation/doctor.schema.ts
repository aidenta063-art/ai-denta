import { z } from "zod";

export const doctorServiceSchema = z.object({
  nameEn: z.string().trim().min(1).max(100),
  nameAr: z.string().trim().min(1).max(100),
  descriptionEn: z.string().trim().min(1).max(300),
  descriptionAr: z.string().trim().min(1).max(300),
});

export const doctorFormSchema = z.object({
  nameEn: z.string().trim().min(1).max(100),
  nameAr: z.string().trim().min(1).max(100),
  locationEn: z.string().trim().min(1).max(100),
  locationAr: z.string().trim().min(1).max(100),
  storyEn: z.string().trim().min(1).max(2000),
  storyAr: z.string().trim().min(1).max(2000),
  services: z.array(doctorServiceSchema).max(12),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type DoctorServiceInput = z.infer<typeof doctorServiceSchema>;
export type DoctorFormInput = z.infer<typeof doctorFormSchema>;
