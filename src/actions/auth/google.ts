"use server";

import { signIn } from "@/lib/auth";
import { isSafeRedirectPath } from "@/lib/safe-redirect";
import type { Locale } from "@/i18n/routing";

export async function googleSignInAction(locale: Locale, next?: string) {
  await signIn("google", {
    redirectTo: isSafeRedirectPath(next) ? next : `/${locale}`,
  });
}
