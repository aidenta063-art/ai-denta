"use server";

import { updateTag, revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { intakeFormConfigInputSchema } from "@/lib/validation/intake-form-config.schema";
import {
  assignIntakeKeys,
  saveIntakeFormSteps,
  INTAKE_FORM_CACHE_TAG,
} from "@/services/content/intake-form.service";

export type IntakeFormBuilderState = { error?: boolean; success?: boolean };

export async function saveIntakeFormStepsAction(
  locale: Locale,
  _prevState: IntakeFormBuilderState,
  formData: FormData,
): Promise<IntakeFormBuilderState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const raw = formData.get("stepsJson");
  if (typeof raw !== "string") return { error: true };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: true };
  }

  const parsed = intakeFormConfigInputSchema.safeParse(parsedJson);
  if (!parsed.success) return { error: true };

  const steps = assignIntakeKeys(parsed.data);
  await saveIntakeFormSteps(steps, session.user.id);

  updateTag(INTAKE_FORM_CACHE_TAG);
  revalidatePath(`/${locale}/dashboard/content/intake-form`);

  return { success: true };
}
