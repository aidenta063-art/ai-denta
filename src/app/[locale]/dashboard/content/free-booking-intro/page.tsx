import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getFreeBookingIntroVideo } from "@/services/content/cms.service";
import { HeroVideoUploader } from "@/components/dashboard/hero-video-uploader";
import {
  setFreeBookingIntroVideoAction,
  clearFreeBookingIntroVideoAction,
} from "@/actions/dashboard/content/free-booking-intro-video";

export default async function FreeBookingIntroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const introVideo = await getFreeBookingIntroVideo();
  const setVideoAction = setFreeBookingIntroVideoAction.bind(null, locale);
  const clearVideoAction = clearFreeBookingIntroVideoAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Free Booking Intro Video
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
          <h2 className="text-sm font-medium text-foreground">Intro video</h2>
          <p className="text-sm text-muted-foreground">
            Shown at the top of the free-consultation page, before visitors
            see the free-booking form. Upload a new video to replace the
            current one.
          </p>
        </div>
        <HeroVideoUploader
          currentVideoUrl={introVideo?.url ?? null}
          setAction={setVideoAction}
          clearAction={clearVideoAction}
        />
      </div>
    </div>
  );
}
