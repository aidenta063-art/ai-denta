"use client";

import { useActionState, useMemo, useState } from "react";
import {
  savePricingAction,
  type PricingActionState,
} from "@/actions/dashboard/content/pricing";
import type { Locale } from "@/i18n/routing";
import type { ConsultationKind, DiscountType } from "@/generated/prisma/enums";
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
    discountEnabled: boolean;
    discountType: DiscountType;
    discountValue: number;
    isActive: boolean;
  };
}) {
  const action = savePricingAction.bind(null, locale, kind);
  const [state, formAction, isPending] = useActionState<
    PricingActionState,
    FormData
  >(action, {});

  const [isActive, setIsActive] = useState(defaults.isActive);

  const [priceEgp, setPriceEgp] = useState(
    defaults.priceCents !== null ? defaults.priceCents / 100 : 0,
  );
  const [discountEnabled, setDiscountEnabled] = useState(
    defaults.discountEnabled,
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    defaults.discountType,
  );
  const [discountValue, setDiscountValue] = useState(
    defaults.discountType === "FIXED"
      ? defaults.discountValue / 100
      : defaults.discountValue,
  );

  const finalPriceEgp = useMemo(() => {
    if (!discountEnabled) return priceEgp;
    const discounted =
      discountType === "PERCENTAGE"
        ? priceEgp * (1 - discountValue / 100)
        : priceEgp - discountValue;
    return Math.max(0, discounted);
  }, [priceEgp, discountEnabled, discountType, discountValue]);

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
              value={priceEgp}
              onChange={(e) => setPriceEgp(Number(e.target.value) || 0)}
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

      {kind === "FREE" && (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <input
              type="checkbox"
              name="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4"
            />
            Show the free consultation option site-wide
          </label>
          <p className="text-xs text-muted-foreground">
            Turn this off to hide every &quot;book a free consultation&quot;
            button and link across the site — the free booking page itself
            will also stop accepting bookings. The paid consultation is
            never affected and always stays bookable.
          </p>
        </div>
      )}

      {kind === "PAID" && (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <input
              type="checkbox"
              name="discountEnabled"
              checked={discountEnabled}
              onChange={(e) => setDiscountEnabled(e.target.checked)}
              className="size-4"
            />
            Enable discount
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${kind}-discountType`}>Discount type</Label>
              <select
                id={`${kind}-discountType`}
                name="discountType"
                value={discountType}
                disabled={!discountEnabled}
                onChange={(e) =>
                  setDiscountType(e.target.value as DiscountType)
                }
                className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none disabled:opacity-50"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount (EGP)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${kind}-discountValue`}>
                Discount value {discountType === "PERCENTAGE" ? "(%)" : "(EGP)"}
              </Label>
              <Input
                id={`${kind}-discountValue`}
                name="discountValue"
                type="number"
                min={0}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                step={discountType === "PERCENTAGE" ? 1 : 0.01}
                disabled={!discountEnabled}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Final price
            </span>
            <span className="text-lg font-semibold text-foreground">
              {finalPriceEgp.toFixed(2)} EGP
              {discountEnabled && finalPriceEgp !== priceEgp && (
                <span className="ms-2 text-sm font-normal text-muted-foreground line-through">
                  {priceEgp.toFixed(2)} EGP
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
