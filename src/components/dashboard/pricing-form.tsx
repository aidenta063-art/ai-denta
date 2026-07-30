"use client";

import { useActionState } from "react";
import {
  savePricingAction,
  type PricingActionState,
} from "@/actions/dashboard/content/pricing";
import type { Locale } from "@/i18n/routing";
import type { ConsultationKind } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PricingForm({
  locale,
  kind,
  defaults,
}: {
  locale: Locale;
  kind: ConsultationKind;
  defaults: {
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    priceCents: number | null;
    durationMinutes: number;
  };
}) {
  const action = savePricingAction.bind(null, locale, kind);
  const [state, formAction, isPending] = useActionState<
    PricingActionState,
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
      {state.success && (
        <Alert>
          <AlertDescription>Saved.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${kind}-nameEn`}>Name (English)</Label>
          <Input
            id={`${kind}-nameEn`}
            name="nameEn"
            defaultValue={defaults.nameEn}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${kind}-nameAr`}>Name (Arabic)</Label>
          <Input
            id={`${kind}-nameAr`}
            name="nameAr"
            dir="rtl"
            defaultValue={defaults.nameAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${kind}-descriptionEn`}>
            Description (English)
          </Label>
          <Input
            id={`${kind}-descriptionEn`}
            name="descriptionEn"
            defaultValue={defaults.descriptionEn}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${kind}-descriptionAr`}>
            Description (Arabic)
          </Label>
          <Input
            id={`${kind}-descriptionAr`}
            name="descriptionAr"
            dir="rtl"
            defaultValue={defaults.descriptionAr}
          />
        </div>
        {kind === "PAID" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${kind}-priceEgp`}>Price (EGP)</Label>
            <Input
              id={`${kind}-priceEgp`}
              name="priceEgp"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                defaults.priceCents !== null
                  ? defaults.priceCents / 100
                  : undefined
              }
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${kind}-durationMinutes`}>Duration (minutes)</Label>
          <Input
            id={`${kind}-durationMinutes`}
            name="durationMinutes"
            type="number"
            min={5}
            max={240}
            defaultValue={defaults.durationMinutes}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
