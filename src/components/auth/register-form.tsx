"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  registerAction,
  type RegisterActionState,
} from "@/actions/auth/register";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterForm({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState<
    RegisterActionState,
    FormData
  >(registerAction, {});

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertDescription>{t("register.success")}</AlertDescription>
        </Alert>
        <Button render={<Link href="/login" locale={locale} />}>
          {t("login.submit")}
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("register.name")}</Label>
        <Input id="name" name="name" required autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("register.email")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("register.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {t("register.submit")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("register.hasAccount")}{" "}
        <Link
          href="/login"
          locale={locale}
          className="font-medium text-primary"
        >
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
