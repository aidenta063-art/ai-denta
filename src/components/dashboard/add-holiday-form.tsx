"use client";

import { useActionState } from "react";
import {
  addHolidayAction,
  type HolidayActionState,
} from "@/actions/dashboard/appointments/holidays";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddHolidayForm({ locale }: { locale: Locale }) {
  const action = addHolidayAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    HolidayActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Please check your input and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input id="reason" name="reason" placeholder="Public holiday" />
      </div>

      <Button type="submit" disabled={isPending}>
        Add holiday
      </Button>
    </form>
  );
}
