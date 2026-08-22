"use client";

import { useActionState, useMemo, useState } from "react";
import {
  saveEbookPriceAction,
  type EbookPriceActionState,
} from "@/actions/dashboard/content/ebook";
import type { Locale } from "@/i18n/routing";
import type { DiscountType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EbookPriceForm({
  locale,
  priceEgp,
  discountEnabled: defaultDiscountEnabled,
  discountType: defaultDiscountType,
  discountValue: defaultDiscountValue,
}: {
  locale: Locale;
  priceEgp: number;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
}) {
  const action = saveEbookPriceAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    EbookPriceActionState,
    FormData
  >(action, {});

  const [price, setPrice] = useState(priceEgp);
  const [discountEnabled, setDiscountEnabled] = useState(defaultDiscountEnabled);
  const [discountType, setDiscountType] = useState<DiscountType>(defaultDiscountType);
  const [discountValue, setDiscountValue] = useState(
    defaultDiscountType === "FIXED" ? defaultDiscountValue / 100 : defaultDiscountValue,
  );

  const finalPrice = useMemo(() => {
    if (!discountEnabled) return price;
    const discounted =
      discountType === "PERCENTAGE"
        ? price * (1 - discountValue / 100)
        : price - discountValue;
    return Math.max(0, discounted);
  }, [price, discountEnabled, discountType, discountValue]);

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

      <div className="flex flex-col gap-2">
        <Label htmlFor="priceEgp">Price (EGP)</Label>
        <Input
          id="priceEgp"
          name="priceEgp"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          required
        />
      </div>

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
            <Label htmlFor="discountType">Discount type</Label>
            <select
              id="discountType"
              name="discountType"
              value={discountType}
              disabled={!discountEnabled}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none disabled:opacity-50"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount (EGP)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="discountValue">
              Discount value {discountType === "PERCENTAGE" ? "(%)" : "(EGP)"}
            </Label>
            <Input
              id="discountValue"
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
          <span className="text-sm text-muted-foreground">Final price</span>
          <span className="text-lg font-semibold text-foreground">
            {finalPrice.toFixed(2)} EGP
            {discountEnabled && finalPrice !== price && (
              <span className="ms-2 text-sm font-normal text-muted-foreground line-through">
                {price.toFixed(2)} EGP
              </span>
            )}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
