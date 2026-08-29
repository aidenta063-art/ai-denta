"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { addFreePdf, removeFreePdf, CMS_TAGS } from "@/services/content/cms.service";

async function revalidateFreePdfPage(locale: Locale) {
  updateTag(CMS_TAGS.freePdf);
  revalidatePath("/ar/free-pdf");
  revalidatePath("/en/free-pdf");
  revalidatePath(`/${locale}/dashboard/content/free-pdf`);
}

export async function addFreePdfAction(locale: Locale, mediaId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await addFreePdf(mediaId, session.user.id);
  await revalidateFreePdfPage(locale);
}

export async function removeFreePdfAction(locale: Locale, mediaId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await removeFreePdf(mediaId);
  await revalidateFreePdfPage(locale);
}
