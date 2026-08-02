"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  attachVideoToHomepage,
  detachVideoFromHomepage,
  CMS_TAGS,
} from "@/services/content/cms.service";

async function revalidateHomepage(locale: Locale) {
  updateTag(CMS_TAGS.homeVideos);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/media`);
}

export async function attachVideoAction(locale: Locale, mediaId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await attachVideoToHomepage(mediaId, session.user.id);
  await revalidateHomepage(locale);
}

export async function detachVideoAction(locale: Locale, mediaId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await detachVideoFromHomepage(mediaId);
  await revalidateHomepage(locale);
}
