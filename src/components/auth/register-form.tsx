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
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export function RegisterForm({
  locale,
  googleEnabled,
}: {
  locale: Locale;
  googleEnabled: boolean;
}) {
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
        <Button
          className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
          render={<Link href="/login" locale={locale} />}
        >
          {t("login.submit")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {googleEnabled && (
        <>
          <GoogleSignInButton locale={locale} />
          <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            {t("orDivider")}
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("register.name")}</Label>
          <Input
            id="name"
            name="name"
            required
            autoFocus
            className="h-11 px-3.5 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("register.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 px-3.5 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("register.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="h-11 px-3.5 text-base"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
        >
          {t("register.submit")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link
            href="/login"
            locale={locale}
            className="font-medium text-[#7E00C9]"
          >
            {t("register.loginLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
