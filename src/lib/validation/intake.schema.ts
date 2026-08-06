import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth.schema";
import type { IntakeFieldConfig, IntakeStepConfig } from "@/lib/intake-fields";

// Core contact fields go on Booking's own columns; everything else is
// stored together as intakeAnswers JSON (see prisma schema).
export const INTAKE_CORE_FIELDS = ["name", "email", "phone"] as const;

function fieldValidator(
  field: IntakeFieldConfig,
): z.ZodType<string | undefined> {
  if (field.type === "select" || field.type === "radio") {
    const values = (field.options ?? []).map((o) => o.value);
    const base = z
      .string()
      .refine((v) => values.includes(v), { message: "Invalid option" });
    return field.required ? base : base.optional();
  }

  let base =
    field.type === "email"
      ? emailSchema
      : z
          .string()
          .trim()
          .max(field.type === "textarea" ? 2000 : 300);
  if (field.required) base = base.min(1);
  return field.required ? base : base.optional();
}

/** Builds the Zod schema for the qualification form from its current
 * admin-editable config — the field set isn't fixed at build time, so
 * this has to happen per-request instead of being a static export. */
export function buildIntakeSchema(steps: IntakeStepConfig[]) {
  const shape: Record<string, z.ZodType<string | undefined>> = {
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(5).max(20),
    email: emailSchema,
  };

  for (const step of steps) {
    for (const field of step.fields) {
      shape[field.key] = fieldValidator(field);
    }
  }

  return z.object(shape);
}

export type IntakeInput = z.infer<ReturnType<typeof buildIntakeSchema>>;
