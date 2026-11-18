"use client";

import { useActionState } from "react";
import {
  saveWhyUsAction,
  type WhyUsActionState,
} from "@/actions/dashboard/content/why-us";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type WhyUsItem = { title: string; description: string };

export function WhyUsForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: {
    eyebrowEn: string;
    titleEn: string;
    subtitleEn: string;
    eyebrowAr: string;
    titleAr: string;
    subtitleAr: string;
    itemsEn: [WhyUsItem, WhyUsItem, WhyUsItem];
    itemsAr: [WhyUsItem, WhyUsItem, WhyUsItem];
  };
}) {
  const action = saveWhyUsAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    WhyUsActionState,
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
        <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">English</legend>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eyebrowEn">Eyebrow</Label>
            <Input id="eyebrowEn" name="eyebrowEn" defaultValue={defaults.eyebrowEn} required />
          </div>
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
            <Label htmlFor="eyebrowAr">Eyebrow</Label>
            <Input id="eyebrowAr" name="eyebrowAr" defaultValue={defaults.eyebrowAr} required />
          </div>
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

      {([0, 1, 2] as const).map((i) => {
        const n = i + 1;
        return (
          <div key={i} className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
            <p className="text-sm font-medium sm:col-span-2">Card {n}</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`item${n}TitleEn`}>Title (English)</Label>
              <Input
                id={`item${n}TitleEn`}
                name={`item${n}TitleEn`}
                defaultValue={defaults.itemsEn[i].title}
                required
              />
              <Label htmlFor={`item${n}DescriptionEn`}>Description (English)</Label>
              <Input
                id={`item${n}DescriptionEn`}
                name={`item${n}DescriptionEn`}
                defaultValue={defaults.itemsEn[i].description}
                required
              />
            </div>
            <div className="flex flex-col gap-2" dir="rtl">
              <Label htmlFor={`item${n}TitleAr`}>العنوان (عربي)</Label>
              <Input
                id={`item${n}TitleAr`}
                name={`item${n}TitleAr`}
                defaultValue={defaults.itemsAr[i].title}
                required
              />
              <Label htmlFor={`item${n}DescriptionAr`}>الوصف (عربي)</Label>
              <Input
                id={`item${n}DescriptionAr`}
                name={`item${n}DescriptionAr`}
                defaultValue={defaults.itemsAr[i].description}
                required
              />
            </div>
          </div>
        );
      })}

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
