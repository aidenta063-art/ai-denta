import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "@/generated/prisma/enums";
import type { ReviewInput } from "@/lib/validation/review.schema";

const CACHE_SECONDS = 60;
export const REVIEW_TAGS = {
  approved: "reviews:approved",
} as const;

export async function createReview(input: ReviewInput) {
  return prisma.review.create({ data: input });
}

// Public-facing list — cached like the rest of the marketing content
// since it's read on every homepage load but only changes when staff
// approve/reject something.
export const listApprovedReviews = nextCache(
  async () =>
    prisma.review.findMany({
      where: { status: ReviewStatus.APPROVED },
      orderBy: { reviewedAt: "desc" },
    }),
  ["reviews-approved"],
  { tags: [REVIEW_TAGS.approved], revalidate: CACHE_SECONDS },
);

/** Oldest first — staff should work through the backlog in submission order. */
export async function listReviews() {
  return prisma.review.findMany({ orderBy: { createdAt: "asc" } });
}

export async function approveReview(id: string, adminUserId: string) {
  await prisma.review.update({
    where: { id },
    data: {
      status: ReviewStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedByUserId: adminUserId,
    },
  });
}

export async function rejectReview(id: string, adminUserId: string) {
  await prisma.review.update({
    where: { id },
    data: {
      status: ReviewStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: adminUserId,
    },
  });
}
