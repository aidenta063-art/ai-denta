"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  setFreeBookingIntroVideo,
  clearFreeBookingIntroVideo,
} from "@/services/content/cms.service";

async function revalidateFreeBookingPage(locale: Locale) {
  revalidatePath("/ar/booking/free");
  revalidatePath("/en/booking/free");
  revalidatePath(`/${locale}/dashboard/content/free-booking-intro`);
}

export async function setFreeBookingIntroVideoAction(
  locale: Locale,
  mediaId: string,
) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await setFreeBookingIntroVideo(mediaId, session.user.id);
  await revalidateFreeBookingPage(locale);
}

export async function clearFreeBookingIntroVideoAction(locale: Locale) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await clearFreeBookingIntroVideo();
  await revalidateFreeBookingPage(locale);
}
