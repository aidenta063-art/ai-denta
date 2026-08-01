"use client";

import { useActionState } from "react";
import {
  saveIntegrationsAction,
  type SaveIntegrationsState,
} from "@/actions/dashboard/settings/integrations";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IntegrationsForm({
  locale,
  defaultPixelId,
}: {
  locale: Locale;
  defaultPixelId: string;
}) {
  const action = saveIntegrationsAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    SaveIntegrationsState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Enter a valid numeric Meta Pixel ID (10–20 digits), or leave it
            blank to disable.
          </AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert>
          <AlertDescription>
            Saved — the pixel will load on your next page view.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
        <Input
          id="metaPixelId"
          name="metaPixelId"
          defaultValue={defaultPixelId}
          placeholder="e.g. 1234567890123456"
          className="max-w-sm"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
