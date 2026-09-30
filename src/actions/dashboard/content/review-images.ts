"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  addReviewImage,
  removeReviewImage,
  CMS_TAGS,
} from "@/services/content/cms.service";

async function revalidateReviewImages(locale: Locale) {
  updateTag(CMS_TAGS.reviewImages);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/customer-reviews`);
}

export async function addReviewImageAction(locale: Locale, mediaId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await addReviewImage(mediaId, session.user.id);
  await revalidateReviewImages(locale);
}

export async function removeReviewImageAction(locale: Locale, mediaId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await removeReviewImage(mediaId);
  await revalidateReviewImages(locale);
}
