"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction, type LoginState } from "@/actions/auth/login";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const action = loginAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("login.email")}</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("login.password")}</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {t("login.submit")}
      </Button>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" locale={locale}>
          {t("login.forgotPassword")}
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link
          href="/register"
          locale={locale}
          className="font-medium text-primary"
        >
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
}
