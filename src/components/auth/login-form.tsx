"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction, type LoginState } from "@/actions/auth/login";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export function LoginForm({
  locale,
  googleEnabled,
  next,
}: {
  locale: Locale;
  googleEnabled: boolean;
  next?: string;
}) {
  const t = useTranslations("Auth");
  const action = loginAction.bind(null, locale, next);
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    action,
    {},
  );

  return (
    <div className="flex flex-col gap-5">
      {googleEnabled && (
        <>
          <GoogleSignInButton locale={locale} next={next} />
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
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            className="h-11 px-3.5 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("login.password")}</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="h-11 px-3.5 text-base"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
        >
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
            href={next ? { pathname: "/register", query: { next } } : "/register"}
            locale={locale}
            className="font-medium text-[#7E00C9]"
          >
            {t("login.registerLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
