"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  approveReview,
  rejectReview,
  REVIEW_TAGS,
} from "@/services/reviews/review.service";
import { logger } from "@/lib/logger";

function revalidateReviews(locale: Locale) {
  updateTag(REVIEW_TAGS.approved);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/reviews`);
}

export async function approveReviewAction(locale: Locale, reviewId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await approveReview(reviewId, session.user.id);
  logger.info(
    { reviewId, approvedByUserId: session.user.id },
    "Review approved",
  );
  revalidateReviews(locale);
}

export async function rejectReviewAction(locale: Locale, reviewId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await rejectReview(reviewId, session.user.id);
  logger.info(
    { reviewId, rejectedByUserId: session.user.id },
    "Review rejected",
  );
  revalidateReviews(locale);
}
