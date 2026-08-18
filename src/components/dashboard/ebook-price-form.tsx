"use client";

import { useActionState } from "react";
import {
  saveEbookPriceAction,
  type EbookPriceActionState,
} from "@/actions/dashboard/content/ebook";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EbookPriceForm({
  locale,
  priceEgp,
}: {
  locale: Locale;
  priceEgp: number;
}) {
  const action = saveEbookPriceAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    EbookPriceActionState,
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="priceEgp">Price (EGP)</Label>
        <Input
          id="priceEgp"
          name="priceEgp"
          type="number"
          min={0}
          step="0.01"
          defaultValue={priceEgp}
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
