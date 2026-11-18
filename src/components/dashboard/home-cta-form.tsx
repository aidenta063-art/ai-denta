"use client";

import { useActionState } from "react";
import {
  saveHomeCtaAction,
  type HomeCtaActionState,
} from "@/actions/dashboard/content/home-cta";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function HomeCtaForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: {
    titleEn: string;
    subtitleEn: string;
    titleAr: string;
    subtitleAr: string;
    isActive: boolean;
  };
}) {
  const action = saveHomeCtaAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    HomeCtaActionState,
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

      <label className="flex w-fit items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaults.isActive}
          className="size-4"
        />
        Show this section on the homepage
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">English</legend>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titleEn">Title</Label>
            <Input id="titleEn" name="titleEn" defaultValue={defaults.titleEn} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitleEn">Subtitle</Label>
            <Input id="subtitleEn" name="subtitleEn" defaultValue={defaults.subtitleEn} required />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4" dir="rtl">
          <legend className="px-1 text-sm font-medium">العربية</legend>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titleAr">Title</Label>
            <Input id="titleAr" name="titleAr" defaultValue={defaults.titleAr} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitleAr">Subtitle</Label>
            <Input id="subtitleAr" name="subtitleAr" defaultValue={defaults.subtitleAr} required />
          </div>
        </fieldset>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
