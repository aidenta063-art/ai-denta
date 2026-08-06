"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { buildIntakeLabelLookup } from "@/lib/intake-labels";
import type { IntakeStepConfig } from "@/lib/intake-fields";

export function IntakeAnswersDialog({
  name,
  intakeAnswers,
  steps,
}: {
  name: string;
  intakeAnswers: unknown;
  steps: IntakeStepConfig[];
}) {
  const answers =
    intakeAnswers && typeof intakeAnswers === "object"
      ? (intakeAnswers as Record<string, unknown>)
      : null;

  if (!answers) return <span className="text-muted-foreground">—</span>;

  const { fieldLabels, order, formatValue } = buildIntakeLabelLookup(steps);
  // Known questions first (in the form's current order), then any
  // historical answers whose question was since renamed or removed —
  // shown with their raw key rather than silently dropped.
  const answerKeys = Object.keys(answers);
  const orderedKeys = [
    ...order.filter((key) => key in answers),
    ...answerKeys.filter((key) => !order.includes(key)),
  ];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <FileText className="size-3.5" />
            Details
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto p-6">
        <h2 className="pe-8 text-lg font-semibold text-popover-foreground">
          {name}&rsquo;s intake answers
        </h2>
        <dl className="mt-4 flex flex-col divide-y divide-border">
          {orderedKeys.map((key) => (
            <div key={key} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm font-medium text-muted-foreground">
                {fieldLabels[key] ?? key}
              </dt>
              <dd className="text-sm text-popover-foreground">
                {formatValue(answers[key])}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
