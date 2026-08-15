"use client";

import { useActionState } from "react";
import {
  createComparisonRowAction,
  updateComparisonRowAction,
  type ComparisonRowActionState,
} from "@/actions/dashboard/content/comparison";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ComparisonRowForm({
  locale,
  row,
}: {
  locale: Locale;
  row?: {
    id: string;
    labelEn: string;
    labelAr: string;
    freeValueEn: string;
    freeValueAr: string;
    paidValueEn: string;
    paidValueAr: string;
    sortOrder: number;
  };
}) {
  const action = row
    ? updateComparisonRowAction.bind(null, locale, row.id)
    : createComparisonRowAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    ComparisonRowActionState,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Label (English)</Label>
          <Input name="labelEn" defaultValue={row?.labelEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Label (Arabic)</Label>
          <Input
            name="labelAr"
            dir="rtl"
            defaultValue={row?.labelAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Free consultation (English)</Label>
          <Input name="freeValueEn" defaultValue={row?.freeValueEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Free consultation (Arabic)</Label>
          <Input
            name="freeValueAr"
            dir="rtl"
            defaultValue={row?.freeValueAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Paid consultation (English)</Label>
          <Input name="paidValueEn" defaultValue={row?.paidValueEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Paid consultation (Arabic)</Label>
          <Input
            name="paidValueAr"
            dir="rtl"
            defaultValue={row?.paidValueAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Sort order</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={row?.sortOrder ?? 0}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {row ? "Save" : "Add row"}
      </Button>
    </form>
  );
}
