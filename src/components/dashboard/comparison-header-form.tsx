"use client";

import { useActionState } from "react";
import {
  saveComparisonHeaderAction,
  type ComparisonHeaderActionState,
} from "@/actions/dashboard/content/comparison";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ComparisonHeaderForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: {
    eyebrowEn: string;
    titleEn: string;
    subtitleEn: string;
    featureLabelEn: string;
    freeNameEn: string;
    paidNameEn: string;
    mostPopularEn: string;
    eyebrowAr: string;
    titleAr: string;
    subtitleAr: string;
    featureLabelAr: string;
    freeNameAr: string;
    paidNameAr: string;
    mostPopularAr: string;
  };
}) {
  const action = saveComparisonHeaderAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    ComparisonHeaderActionState,
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="featureLabelEn">Feature column label</Label>
            <Input id="featureLabelEn" name="featureLabelEn" defaultValue={defaults.featureLabelEn} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="freeNameEn">Free column name</Label>
            <Input id="freeNameEn" name="freeNameEn" defaultValue={defaults.freeNameEn} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paidNameEn">Paid column name</Label>
            <Input id="paidNameEn" name="paidNameEn" defaultValue={defaults.paidNameEn} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mostPopularEn">&quot;Most popular&quot; badge</Label>
            <Input id="mostPopularEn" name="mostPopularEn" defaultValue={defaults.mostPopularEn} required />
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="featureLabelAr">Feature column label</Label>
            <Input id="featureLabelAr" name="featureLabelAr" defaultValue={defaults.featureLabelAr} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="freeNameAr">Free column name</Label>
            <Input id="freeNameAr" name="freeNameAr" defaultValue={defaults.freeNameAr} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paidNameAr">Paid column name</Label>
            <Input id="paidNameAr" name="paidNameAr" defaultValue={defaults.paidNameAr} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mostPopularAr">&quot;Most popular&quot; badge</Label>
            <Input id="mostPopularAr" name="mostPopularAr" defaultValue={defaults.mostPopularAr} required />
          </div>
        </fieldset>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
