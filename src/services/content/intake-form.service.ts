import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_INTAKE_STEPS,
  type IntakeStepConfig,
} from "@/lib/intake-fields";
import type { IntakeStepInput } from "@/lib/validation/intake-form-config.schema";
import { INTAKE_CORE_FIELDS } from "@/lib/validation/intake.schema";

const CACHE_SECONDS = 60;
export const INTAKE_FORM_CACHE_TAG = "cms:intake-form-steps";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "") || "field"
  );
}

/** Admin-added fields/options arrive with an empty key/value; this fills
 * them in from the label (slugified) and dedupes so field keys stay
 * unique across the whole form — intakeAnswers is one flat JSON object
 * keyed by field key, so a collision would silently overwrite an answer. */
export function assignIntakeKeys(steps: IntakeStepInput[]): IntakeStepConfig[] {
  const usedKeys = new Set<string>(INTAKE_CORE_FIELDS);
  for (const step of steps) {
    for (const field of step.fields) {
      if (field.key) usedKeys.add(field.key);
    }
  }

  function nextUnique(base: string, used: Set<string>) {
    let candidate = base;
    let attempt = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${attempt++}`;
    }
    used.add(candidate);
    return candidate;
  }

  return steps.map((step) => ({
    titleEn: step.titleEn,
    titleAr: step.titleAr,
    fields: step.fields.map((field) => {
      const key = field.key || nextUnique(slugify(field.labelEn), usedKeys);
      const usedValues = new Set(
        field.options?.filter((o) => o.value).map((o) => o.value) ?? [],
      );
      const options = field.options?.map((opt) => ({
        value: opt.value || nextUnique(slugify(opt.labelEn), usedValues),
        labelEn: opt.labelEn,
        labelAr: opt.labelAr,
      }));
      return {
        key,
        type: field.type,
        required: field.required,
        labelEn: field.labelEn,
        labelAr: field.labelAr,
        placeholderEn: field.placeholderEn || undefined,
        placeholderAr: field.placeholderAr || undefined,
        options,
      };
    }),
  }));
}

export const getIntakeFormSteps = nextCache(
  async (): Promise<IntakeStepConfig[]> => {
    const config = await prisma.intakeFormConfig.findUnique({
      where: { id: "singleton" },
    });
    return (
      (config?.steps as unknown as IntakeStepConfig[] | undefined) ??
      DEFAULT_INTAKE_STEPS
    );
  },
  ["cms-intake-form-steps"],
  { tags: [INTAKE_FORM_CACHE_TAG], revalidate: CACHE_SECONDS },
);

export async function saveIntakeFormSteps(
  steps: IntakeStepConfig[],
  updatedById: string,
) {
  await prisma.intakeFormConfig.upsert({
    where: { id: "singleton" },
    update: { steps: steps as object, updatedById },
    create: { id: "singleton", steps: steps as object, updatedById },
  });
}
