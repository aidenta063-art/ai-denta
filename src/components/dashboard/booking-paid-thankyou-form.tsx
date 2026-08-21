"use client";

import { useActionState } from "react";
import {
  saveBookingPaidThankYouAction,
  type BookingPaidThankYouActionState,
} from "@/actions/dashboard/content/booking-paid-thankyou";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Defaults = {
  pendingTitleEn: string;
  pendingDescriptionEn: string;
  confirmedTitleEn: string;
  confirmedDescriptionEn: string;
  consultationLabelEn: string;
  dateLabelEn: string;
  priceLabelEn: string;
  backHomeEn: string;
  upsellBadgeEn: string;
  upsellTitleEn: string;
  upsellDescriptionEn: string;
  upsellBonusEn: string;
  upsellCtaEn: string;
  pendingTitleAr: string;
  pendingDescriptionAr: string;
  confirmedTitleAr: string;
  confirmedDescriptionAr: string;
  consultationLabelAr: string;
  dateLabelAr: string;
  priceLabelAr: string;
  backHomeAr: string;
  upsellBadgeAr: string;
  upsellTitleAr: string;
  upsellDescriptionAr: string;
  upsellBonusAr: string;
  upsellCtaAr: string;
};

function LocaleFields({
  suffix,
  dir,
  defaults,
}: {
  suffix: "En" | "Ar";
  dir?: "rtl";
  defaults: Defaults;
}) {
  const f = (name: string) => `${name}${suffix}` as keyof Defaults;
  return (
    <fieldset
      className="flex flex-col gap-4 rounded-lg border border-border p-4"
      dir={dir}
    >
      <legend className="px-1 text-sm font-medium">
        {suffix === "En" ? "English" : "العربية"}
      </legend>

      <div className="flex flex-col gap-2">
        <Label htmlFor={f("pendingTitle")}>Title while payment is pending</Label>
        <Input id={f("pendingTitle")} name={f("pendingTitle")} defaultValue={defaults[f("pendingTitle")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("pendingDescription")}>Description while payment is pending</Label>
        <Input id={f("pendingDescription")} name={f("pendingDescription")} defaultValue={defaults[f("pendingDescription")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("confirmedTitle")}>Title once confirmed</Label>
        <Input id={f("confirmedTitle")} name={f("confirmedTitle")} defaultValue={defaults[f("confirmedTitle")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("confirmedDescription")}>Description once confirmed</Label>
        <Input id={f("confirmedDescription")} name={f("confirmedDescription")} defaultValue={defaults[f("confirmedDescription")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("consultationLabel")}>&quot;Consultation&quot; field label</Label>
        <Input id={f("consultationLabel")} name={f("consultationLabel")} defaultValue={defaults[f("consultationLabel")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("dateLabel")}>&quot;Date&quot; field label</Label>
        <Input id={f("dateLabel")} name={f("dateLabel")} defaultValue={defaults[f("dateLabel")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("priceLabel")}>&quot;Price&quot; field label</Label>
        <Input id={f("priceLabel")} name={f("priceLabel")} defaultValue={defaults[f("priceLabel")]} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={f("backHome")}>&quot;Back to homepage&quot; button</Label>
        <Input id={f("backHome")} name={f("backHome")} defaultValue={defaults[f("backHome")]} required />
      </div>

      <div className="mt-2 flex flex-col gap-4 rounded-lg bg-secondary/40 p-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Free ebook gift card
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor={f("upsellBadge")}>Badge</Label>
          <Input id={f("upsellBadge")} name={f("upsellBadge")} defaultValue={defaults[f("upsellBadge")]} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={f("upsellTitle")}>Title</Label>
          <Input id={f("upsellTitle")} name={f("upsellTitle")} defaultValue={defaults[f("upsellTitle")]} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={f("upsellDescription")}>Description</Label>
          <Input id={f("upsellDescription")} name={f("upsellDescription")} defaultValue={defaults[f("upsellDescription")]} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={f("upsellBonus")}>Bonus line (30% content, etc.)</Label>
          <Input id={f("upsellBonus")} name={f("upsellBonus")} defaultValue={defaults[f("upsellBonus")]} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={f("upsellCta")}>Download button text</Label>
          <Input id={f("upsellCta")} name={f("upsellCta")} defaultValue={defaults[f("upsellCta")]} required />
        </div>
      </div>
    </fieldset>
  );
}

export function BookingPaidThankYouForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: Defaults;
}) {
  const action = saveBookingPaidThankYouAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    BookingPaidThankYouActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Please check your input and try again.
          </AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert>
          <AlertDescription>Saved.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <LocaleFields suffix="En" defaults={defaults} />
        <LocaleFields suffix="Ar" dir="rtl" defaults={defaults} />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
