import { z } from "zod";

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().min(1).max(400),
});

export const comparisonHeaderContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(150),
  subtitle: z.string().trim().min(1).max(300),
  featureLabel: z.string().trim().min(1).max(60),
  freeName: z.string().trim().min(1).max(60),
  paidName: z.string().trim().min(1).max(60),
  mostPopular: z.string().trim().min(1).max(40),
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
  // Only meaningful for the FREE consultation type — the paid type is
  // always forced active in updateConsultationTypePricing regardless of
  // this value, since it must never be hideable.
  isActive: z.boolean(),
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

export const comparisonRowFormSchema = z.object({
  labelEn: z.string().trim().min(1).max(60),
  labelAr: z.string().trim().min(1).max(60),
  freeValueEn: z.string().trim().min(1).max(120),
  freeValueAr: z.string().trim().min(1).max(120),
  paidValueEn: z.string().trim().min(1).max(120),
  paidValueAr: z.string().trim().min(1).max(120),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const ebookPriceFormSchema = z.object({
  priceEgp: z.coerce.number().min(0),
  discountEnabled: z.boolean(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  // Whole-number percent (0-100) when discountType is PERCENTAGE, EGP
  // amount (same unit as priceEgp) when FIXED.
  discountValue: z.coerce.number().min(0),
}).refine(
  (data) => data.discountType !== "PERCENTAGE" || data.discountValue <= 100,
  { path: ["discountValue"], message: "Percentage discount can't exceed 100" },
);

export const comparisonHeaderFormSchema = z.object({
  eyebrowEn: z.string().trim().min(1).max(80),
  titleEn: z.string().trim().min(1).max(150),
  subtitleEn: z.string().trim().min(1).max(300),
  featureLabelEn: z.string().trim().min(1).max(60),
  freeNameEn: z.string().trim().min(1).max(60),
  paidNameEn: z.string().trim().min(1).max(60),
  mostPopularEn: z.string().trim().min(1).max(40),
  eyebrowAr: z.string().trim().min(1).max(80),
  titleAr: z.string().trim().min(1).max(150),
  subtitleAr: z.string().trim().min(1).max(300),
  featureLabelAr: z.string().trim().min(1).max(60),
  freeNameAr: z.string().trim().min(1).max(60),
  paidNameAr: z.string().trim().min(1).max(60),
  mostPopularAr: z.string().trim().min(1).max(40),
});

export const bookingPaidThankYouContentSchema = z.object({
  pendingTitle: z.string().trim().min(1).max(150),
  pendingDescription: z.string().trim().min(1).max(400),
  confirmedTitle: z.string().trim().min(1).max(150),
  confirmedDescription: z.string().trim().min(1).max(400),
  consultationLabel: z.string().trim().min(1).max(60),
  dateLabel: z.string().trim().min(1).max(60),
  priceLabel: z.string().trim().min(1).max(60),
  backHome: z.string().trim().min(1).max(60),
  upsell: z.object({
    badge: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(300),
    bonus: z.string().trim().min(1).max(200),
    cta: z.string().trim().min(1).max(60),
  }),
});

export const bookingPaidThankYouFormSchema = z.object({
  pendingTitleEn: z.string().trim().min(1).max(150),
  pendingDescriptionEn: z.string().trim().min(1).max(400),
  confirmedTitleEn: z.string().trim().min(1).max(150),
  confirmedDescriptionEn: z.string().trim().min(1).max(400),
  consultationLabelEn: z.string().trim().min(1).max(60),
  dateLabelEn: z.string().trim().min(1).max(60),
  priceLabelEn: z.string().trim().min(1).max(60),
  backHomeEn: z.string().trim().min(1).max(60),
  upsellBadgeEn: z.string().trim().min(1).max(80),
  upsellTitleEn: z.string().trim().min(1).max(150),
  upsellDescriptionEn: z.string().trim().min(1).max(300),
  upsellBonusEn: z.string().trim().min(1).max(200),
  upsellCtaEn: z.string().trim().min(1).max(60),
  pendingTitleAr: z.string().trim().min(1).max(150),
  pendingDescriptionAr: z.string().trim().min(1).max(400),
  confirmedTitleAr: z.string().trim().min(1).max(150),
  confirmedDescriptionAr: z.string().trim().min(1).max(400),
  consultationLabelAr: z.string().trim().min(1).max(60),
  dateLabelAr: z.string().trim().min(1).max(60),
  priceLabelAr: z.string().trim().min(1).max(60),
  backHomeAr: z.string().trim().min(1).max(60),
  upsellBadgeAr: z.string().trim().min(1).max(80),
  upsellTitleAr: z.string().trim().min(1).max(150),
  upsellDescriptionAr: z.string().trim().min(1).max(300),
  upsellBonusAr: z.string().trim().min(1).max(200),
  upsellCtaAr: z.string().trim().min(1).max(60),
});

export type HeroFormInput = z.infer<typeof heroFormSchema>;
export type PricingFormInput = z.infer<typeof pricingFormSchema>;
export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
export type ComparisonRowFormInput = z.infer<typeof comparisonRowFormSchema>;
export type EbookPriceFormInput = z.infer<typeof ebookPriceFormSchema>;
export type ComparisonHeaderFormInput = z.infer<
  typeof comparisonHeaderFormSchema
>;
export type BookingPaidThankYouFormInput = z.infer<
  typeof bookingPaidThankYouFormSchema
>;
