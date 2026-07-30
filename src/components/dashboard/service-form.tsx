"use client";

import { useActionState } from "react";
import {
  createServiceAction,
  updateServiceAction,
  type ServiceActionState,
} from "@/actions/dashboard/content/services";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ServiceForm({
  locale,
  service,
}: {
  locale: Locale;
  service?: {
    id: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string | null;
    descriptionAr: string | null;
    sortOrder: number;
  };
}) {
  const action = service
    ? updateServiceAction.bind(null, locale, service.id)
    : createServiceAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    ServiceActionState,
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
          <Label>Name (English)</Label>
          <Input name="nameEn" defaultValue={service?.nameEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Name (Arabic)</Label>
          <Input
            name="nameAr"
            dir="rtl"
            defaultValue={service?.nameAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description (English)</Label>
          <Input name="descriptionEn" defaultValue={service?.descriptionEn ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description (Arabic)</Label>
          <Input
            name="descriptionAr"
            dir="rtl"
            defaultValue={service?.descriptionAr ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Sort order</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={service?.sortOrder ?? 0}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {service ? "Save" : "Add service"}
      </Button>
    </form>
  );
}
