import { z } from "zod";

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().min(1).max(400),
});

export const heroFormSchema = z.object({
  eyebrowEn: z.string().trim().min(1).max(80),
  titleEn: z.string().trim().min(1).max(200),
  subtitleEn: z.string().trim().min(1).max(400),
  eyebrowAr: z.string().trim().min(1).max(80),
  titleAr: z.string().trim().min(1).max(200),
  subtitleAr: z.string().trim().min(1).max(400),
});

export const pricingFormSchema = z.object({
  nameEn: z.string().trim().min(1).max(100),
  nameAr: z.string().trim().min(1).max(100),
  descriptionEn: z.string().trim().max(400).optional().or(z.literal("")),
  descriptionAr: z.string().trim().max(400).optional().or(z.literal("")),
  priceEgp: z.coerce.number().min(0).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(240),
  discountEnabled: z.boolean(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  // Whole-number percent (0-100) when discountType is PERCENTAGE, EGP
  // amount (same unit as priceEgp) when FIXED.
  discountValue: z.coerce.number().min(0),
}).refine(
  (data) => data.discountType !== "PERCENTAGE" || data.discountValue <= 100,
  { path: ["discountValue"], message: "Percentage discount can't exceed 100" },
);

export const serviceFormSchema = z.object({
  nameEn: z.string().trim().min(1).max(100),
  nameAr: z.string().trim().min(1).max(100),
  descriptionEn: z.string().trim().max(400).optional().or(z.literal("")),
  descriptionAr: z.string().trim().max(400).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type HeroFormInput = z.infer<typeof heroFormSchema>;
export type PricingFormInput = z.infer<typeof pricingFormSchema>;
export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
