"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { googleSignInAction } from "@/actions/auth/google";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";
import type { Locale } from "@/i18n/routing";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="h-11 w-full gap-2.5 border-border/80 bg-white text-base font-medium text-foreground shadow-sm hover:bg-secondary/60"
    >
      <GoogleIcon className="size-5" />
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function GoogleSignInButton({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");

  return (
    <form action={googleSignInAction.bind(null, locale)}>
      <SubmitButton
        label={t("continueWithGoogle")}
        pendingLabel={t("continueWithGooglePending")}
      />
    </form>
  );
}
