"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  requestPasswordResetAction,
  type RequestPasswordResetState,
} from "@/actions/auth/request-password-reset";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const action = requestPasswordResetAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    RequestPasswordResetState,
    FormData
  >(action, {});

  if (state.success) {
    return (
      <Alert>
        <AlertDescription>{t("forgotPassword.success")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground">
        {t("forgotPassword.description")}
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("forgotPassword.email")}</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {t("forgotPassword.submit")}
      </Button>
    </form>
  );
}
