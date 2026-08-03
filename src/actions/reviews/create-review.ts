"use server";

import { reviewSchema } from "@/lib/validation/review.schema";
import { createReview } from "@/services/reviews/review.service";
import { checkActionRateLimit } from "@/lib/rate-limit";

export type ReviewFormState = {
  error?: "invalidInput" | "rateLimited";
  success?: boolean;
};

// Open to anyone, no login required — a strict rate limit is the main
// defense against spam, and nothing submitted here is public until an
// admin approves it (see the dashboard reviews queue).
export async function createReviewAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const { allowed } = await checkActionRateLimit("create-review", {
    limit: 3,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const parsed = reviewSchema.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await createReview(parsed.data);

  return { success: true };
}
