"use server";

import { signIn } from "@/lib/auth";
import type { Locale } from "@/i18n/routing";

export async function googleSignInAction(locale: Locale) {
  await signIn("google", { redirectTo: `/${locale}` });
}
