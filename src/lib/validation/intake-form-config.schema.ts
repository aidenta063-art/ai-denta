import { z } from "zod";

const FIELD_TYPES = [
  "text",
  "tel",
  "email",
  "select",
  "radio",
  "textarea",
] as const;

export const intakeOptionInputSchema = z.object({
  value: z.string().trim().max(100),
  labelEn: z.string().trim().min(1).max(200),
  labelAr: z.string().trim().min(1).max(200),
});

export const intakeFieldInputSchema = z
  .object({
    key: z.string().trim().max(100),
    type: z.enum(FIELD_TYPES),
    required: z.boolean(),
    labelEn: z.string().trim().min(1).max(200),
    labelAr: z.string().trim().min(1).max(200),
    placeholderEn: z.string().trim().max(300).optional(),
    placeholderAr: z.string().trim().max(300).optional(),
    options: z.array(intakeOptionInputSchema).optional(),
  })
  .refine(
    (field) =>
      !["select", "radio"].includes(field.type) ||
      (field.options && field.options.length > 0),
    { message: "Select and radio questions need at least one option." },
  );

export const intakeStepInputSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().min(1).max(200),
  fields: z.array(intakeFieldInputSchema),
});

export const intakeFormConfigInputSchema = z
  .array(intakeStepInputSchema)
  .min(1);

export type IntakeStepInput = z.infer<typeof intakeStepInputSchema>;
