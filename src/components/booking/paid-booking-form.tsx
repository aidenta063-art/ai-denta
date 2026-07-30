"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  createPaidBookingHoldAction,
  type PaidBookingHoldState,
} from "@/actions/booking/create-paid-booking-hold";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PaidBookingForm({
  locale,
  slotId,
}: {
  locale: Locale;
  slotId: string;
}) {
  const t = useTranslations("Booking.paid");
  const action = createPaidBookingHoldAction.bind(null, locale, slotId);
  const [state, formAction, isPending] = useActionState<
    PaidBookingHoldState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          className="h-11 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          className="h-11 px-3.5 text-base"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
      >
        {t("submit")}
      </Button>
    </form>
  );
}
