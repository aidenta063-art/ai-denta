"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { setFreePdf, clearFreePdf } from "@/services/content/cms.service";

async function revalidateFreePdfPage(locale: Locale) {
  revalidatePath("/ar/free-pdf");
  revalidatePath("/en/free-pdf");
  revalidatePath(`/${locale}/dashboard/content/free-pdf`);
}

export async function setFreePdfAction(locale: Locale, mediaId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await setFreePdf(mediaId, session.user.id);
  await revalidateFreePdfPage(locale);
}

export async function clearFreePdfAction(locale: Locale) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await clearFreePdf();
  await revalidateFreePdfPage(locale);
}
