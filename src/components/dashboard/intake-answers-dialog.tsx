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
  phone,
  appointment,
}: {
  name: string;
  intakeAnswers: unknown;
  steps: IntakeStepConfig[];
  phone?: string | null;
  /** Pre-formatted booked date/time, e.g. "Sep 25, 2026, 6:00 – 6:30 PM". */
  appointment?: string | null;
}) {
  const answers =
    intakeAnswers && typeof intakeAnswers === "object"
      ? (intakeAnswers as Record<string, unknown>)
      : null;

  if (!answers && !phone && !appointment) {
    return <span className="text-muted-foreground">—</span>;
  }

  const { fieldLabels, order, formatValue } = buildIntakeLabelLookup(steps);
  // Known questions first (in the form's current order), then any
  // historical answers whose question was since renamed or removed —
  // shown with their raw key rather than silently dropped.
  const answerMap = answers ?? {};
  const answerKeys = Object.keys(answerMap);
  const orderedKeys = [
    ...order.filter((key) => key in answerMap),
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
          {name}&rsquo;s details
        </h2>
        <dl className="mt-4 flex flex-col divide-y divide-border">
          {phone && (
            <div className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm font-medium text-muted-foreground">
                Phone number
              </dt>
              <dd className="text-sm text-popover-foreground" dir="ltr">
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </dd>
            </div>
          )}
          {appointment && (
            <div className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm font-medium text-muted-foreground">
                Booked appointment
              </dt>
              <dd className="text-sm text-popover-foreground">{appointment}</dd>
            </div>
          )}
          {orderedKeys.map((key) => (
            <div key={key} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm font-medium text-muted-foreground">
                {fieldLabels[key] ?? key}
              </dt>
              <dd className="text-sm text-popover-foreground">
                {formatValue(answerMap[key])}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
