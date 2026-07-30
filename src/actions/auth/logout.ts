"use server";

import { signOut } from "@/lib/auth";
import type { Locale } from "@/i18n/routing";

export async function logoutAction(locale: Locale) {
  await signOut({ redirectTo: `/${locale}` });
}
