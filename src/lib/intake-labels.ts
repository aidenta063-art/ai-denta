import type { IntakeStepConfig } from "@/lib/intake-fields";

/** Dashboard is English-only, so labels/option text are always pulled
 * as the English side of the admin-editable config. Historical answers
 * whose question was since renamed/removed fall back to the raw key or
 * value instead of disappearing. */
export function buildIntakeLabelLookup(steps: IntakeStepConfig[]) {
  const fieldLabels: Record<string, string> = {};
  const optionLabels: Record<string, string> = {};
  const order: string[] = [];

  for (const step of steps) {
    for (const field of step.fields) {
      fieldLabels[field.key] = field.labelEn;
      order.push(field.key);
      for (const opt of field.options ?? []) {
        optionLabels[opt.value] = opt.labelEn;
      }
    }
  }

  function formatValue(value: unknown): string {
    if (typeof value !== "string") return "—";
    return optionLabels[value] ?? value;
  }

  return { fieldLabels, order, formatValue };
}
