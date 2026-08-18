"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/actions/account/update-profile";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProfileEditForm({
  locale,
  name,
  phone,
}: {
  locale: Locale;
  name: string;
  phone: string;
}) {
  const t = useTranslations("Account");
  const action = updateProfileAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    UpdateProfileActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t("editError")}</AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert>
          <AlertDescription>{t("saved")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("phoneLabel")}</Label>
          <Input id="phone" name="phone" defaultValue={phone} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="h-9 w-fit">
        {t("saveButton")}
      </Button>
    </form>
  );
}
