"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/actions/auth/reset-password";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetPasswordForm({
  locale,
  token,
}: {
  locale: Locale;
  token: string;
}) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction, {});

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertDescription>{t("resetPassword.success")}</AlertDescription>
        </Alert>
        <Button render={<Link href="/login" locale={locale} />}>
          {t("resetPassword.loginLink")}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("resetPassword.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoFocus
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {t("resetPassword.submit")}
      </Button>
    </form>
  );
}
