"use client";

import { useActionState } from "react";
import {
  saveSocialLinksAction,
  type SaveSocialLinksState,
} from "@/actions/dashboard/settings/social-links";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SocialLinksForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: {
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    youtubeUrl: string;
  };
}) {
  const action = saveSocialLinksAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    SaveSocialLinksState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Each link must be a full URL starting with http:// or https://,
            or left blank.
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
          <Label htmlFor="facebookUrl">Facebook</Label>
          <Input
            id="facebookUrl"
            name="facebookUrl"
            type="url"
            placeholder="https://facebook.com/..."
            defaultValue={defaults.facebookUrl}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="instagramUrl">Instagram</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            placeholder="https://instagram.com/..."
            defaultValue={defaults.instagramUrl}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tiktokUrl">TikTok</Label>
          <Input
            id="tiktokUrl"
            name="tiktokUrl"
            type="url"
            placeholder="https://tiktok.com/@..."
            defaultValue={defaults.tiktokUrl}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="youtubeUrl">YouTube</Label>
          <Input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            placeholder="https://youtube.com/@..."
            defaultValue={defaults.youtubeUrl}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Leave a field blank to hide that link from the site footer.
      </p>

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
