"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { setHeroVideo, clearHeroVideo } from "@/services/content/cms.service";

async function revalidateHomepage(locale: Locale) {
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/hero`);
}

export async function setHeroVideoAction(locale: Locale, mediaId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await setHeroVideo(mediaId, session.user.id);
  await revalidateHomepage(locale);
}

export async function clearHeroVideoAction(locale: Locale) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await clearHeroVideo();
  await revalidateHomepage(locale);
}
