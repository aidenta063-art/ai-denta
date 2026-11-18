import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getDoctorTestimonialVideo } from "@/services/content/cms.service";
import { HeroVideoUploader } from "@/components/dashboard/hero-video-uploader";
import {
  setDoctorTestimonialVideoAction,
  clearDoctorTestimonialVideoAction,
} from "@/actions/dashboard/content/doctor-testimonial-video";

export default async function DoctorTestimonialVideoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const video = await getDoctorTestimonialVideo();
  const setVideoAction = setDoctorTestimonialVideoAction.bind(null, locale);
  const clearVideoAction = clearDoctorTestimonialVideoAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Doctor Testimonials Video
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
            Testimonials video
          </h2>
          <p className="text-sm text-muted-foreground">
            A video of doctors talking about their experience, shown on the
            homepage to build trust. The section is hidden automatically
            until a video is uploaded here.
          </p>
        </div>
        <HeroVideoUploader
          currentVideoUrl={video?.url ?? null}
          setAction={setVideoAction}
          clearAction={clearVideoAction}
        />
      </div>
    </div>
  );
}
