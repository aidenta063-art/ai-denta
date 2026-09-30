import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getReviewImages } from "@/services/content/cms.service";
import { ReviewImagesUploader } from "@/components/dashboard/review-images-uploader";
import {
  addReviewImageAction,
  removeReviewImageAction,
} from "@/actions/dashboard/content/review-images";

export default async function CustomerReviewsContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const images = await getReviewImages();
  const addAction = addReviewImageAction.bind(null, locale);
  const removeAction = removeReviewImageAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Customer Reviews
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <div className="flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Result screenshots
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload screenshots of results — leads/bookings dashboards,
            WhatsApp conversations, campaign creatives. They&apos;re shown as
            a scrolling gallery on the homepage, below the ebook section.
          </p>
        </div>
        <ReviewImagesUploader
          images={images.map((image) => ({ id: image.id, url: image.url }))}
          addAction={addAction}
          removeAction={removeAction}
        />
      </div>
    </div>
  );
}
