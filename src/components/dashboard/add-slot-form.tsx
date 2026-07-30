"use client";

import { useActionState } from "react";
import {
  addSlotAction,
  type AddSlotActionState,
} from "@/actions/dashboard/appointments/add-slot";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ERROR_MESSAGES: Record<string, string> = {
  invalidInput: "Please check the times and try again.",
  invalidRange: "End time must be after start time.",
  overlap: "This overlaps an existing slot on this day.",
};

export function AddSlotForm({
  locale,
  date,
}: {
  locale: Locale;
  date: string;
}) {
  const action = addSlotAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    AddSlotActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="date" value={date} />
      {state.error && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>
            {ERROR_MESSAGES[state.error]}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Start</label>
        <Input type="time" name="startTime" defaultValue="10:00" required />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">End</label>
        <Input type="time" name="endTime" defaultValue="10:30" required />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        Add slot
      </Button>
    </form>
  );
}
