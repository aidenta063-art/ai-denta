"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import {
  INTAKE_ANSWER_ORDER,
  INTAKE_FIELD_LABELS,
  formatIntakeAnswerValue,
} from "@/lib/intake-labels";

export function IntakeAnswersDialog({
  name,
  intakeAnswers,
}: {
  name: string;
  intakeAnswers: unknown;
}) {
  const answers =
    intakeAnswers && typeof intakeAnswers === "object"
      ? (intakeAnswers as Record<string, unknown>)
      : null;

  if (!answers) return <span className="text-muted-foreground">—</span>;

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
          {INTAKE_ANSWER_ORDER.filter((key) => key in answers).map((key) => (
            <div key={key} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="text-sm font-medium text-muted-foreground">
                {INTAKE_FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="text-sm text-popover-foreground">
                {formatIntakeAnswerValue(key, answers[key])}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
