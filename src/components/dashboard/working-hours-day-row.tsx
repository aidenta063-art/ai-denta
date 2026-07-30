"use client";

import { useActionState, useState } from "react";
import {
  saveWorkingHoursDayAction,
  type WorkingHoursActionState,
} from "@/actions/dashboard/appointments/working-hours";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkingHoursDayRow({
  locale,
  weekday,
  dayLabel,
  rule,
}: {
  locale: Locale;
  weekday: number;
  dayLabel: string;
  rule: { startTime: string; endTime: string; slotLengthMinutes: number } | null;
}) {
  const action = saveWorkingHoursDayAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    WorkingHoursActionState,
    FormData
  >(action, {});
  const [dayOff, setDayOff] = useState(rule === null);

  return (
    <form
      action={formAction}
      className="grid grid-cols-[7rem_1fr_1fr_5rem_auto_auto] items-center gap-3 border-t border-border px-4 py-3"
    >
      <input type="hidden" name="weekday" value={weekday} />
      <span className="font-medium text-card-foreground">{dayLabel}</span>

      <Input
        type="time"
        name="startTime"
        defaultValue={rule?.startTime ?? "10:00"}
        disabled={dayOff}
        required={!dayOff}
      />
      <Input
        type="time"
        name="endTime"
        defaultValue={rule?.endTime ?? "18:00"}
        disabled={dayOff}
        required={!dayOff}
      />
      <Input
        type="number"
        name="slotLengthMinutes"
        min={5}
        max={240}
        defaultValue={rule?.slotLengthMinutes ?? 30}
        disabled={dayOff}
        required={!dayOff}
      />

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="dayOff"
          checked={dayOff}
          onChange={(e) => setDayOff(e.target.checked)}
          className="size-4"
        />
        Day off
      </label>

      <Button type="submit" size="sm" disabled={isPending}>
        Save
      </Button>

      {state.error && (
        <span className="col-span-full text-xs text-destructive">
          Please check start/end times.
        </span>
      )}
    </form>
  );
}
