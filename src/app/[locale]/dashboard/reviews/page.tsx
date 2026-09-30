import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/marketing/star-rating";
import { listReviews } from "@/services/reviews/review.service";
import {
  approveReviewAction,
  rejectReviewAction,
} from "@/actions/dashboard/reviews/moderate-review";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ReviewStatus } from "@/generated/prisma/enums";
import { APP_TIME_ZONE } from "@/lib/timezone";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const reviews = await listReviews();
  const approve = approveReviewAction.bind(null, locale);
  const reject = rejectReviewAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Reviews</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Name</th>
              <th className="px-4 py-2 text-start">Rating</th>
              <th className="px-4 py-2 text-start">Review</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  No reviews yet.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {review.name}
                </td>
                <td className="px-4 py-2">
                  <StarRating rating={review.rating} />
                </td>
                <td className="max-w-sm px-4 py-2 text-card-foreground">
                  {review.text}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={review.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeZone: APP_TIME_ZONE,
                  }).format(review.createdAt)}
                </td>
                <td className="px-4 py-2 text-end">
                  {review.status === ReviewStatus.PENDING && (
                    <div className="flex justify-end gap-2">
                      <form action={reject.bind(null, review.id)}>
                        <Button size="sm" variant="outline" type="submit">
                          Reject
                        </Button>
                      </form>
                      <form action={approve.bind(null, review.id)}>
                        <Button size="sm" type="submit">
                          Approve
                        </Button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
