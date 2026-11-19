import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  getDoctorTestimonialVideo,
  getDoctorTestimonialsContent,
} from "@/services/content/cms.service";
import { doctorTestimonialsContentSchema } from "@/lib/validation/cms.schema";
import { HeroVideoUploader } from "@/components/dashboard/hero-video-uploader";
import { DoctorTestimonialsTextForm } from "@/components/dashboard/doctor-testimonials-text-form";
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

  const [video, section, tEn, tAr] = await Promise.all([
    getDoctorTestimonialVideo(),
    getDoctorTestimonialsContent(),
    getTranslations({ locale: "en", namespace: "HomePage.doctorTestimonials" }),
    getTranslations({ locale: "ar", namespace: "HomePage.doctorTestimonials" }),
  ]);
  const setVideoAction = setDoctorTestimonialVideoAction.bind(null, locale);
  const clearVideoAction = clearDoctorTestimonialVideoAction.bind(null, locale);

  const enParsed = section
    ? doctorTestimonialsContentSchema.safeParse(section.contentEn)
    : null;
  const arParsed = section
    ? doctorTestimonialsContentSchema.safeParse(section.contentAr)
    : null;

  const textDefaults = {
    eyebrowEn: enParsed?.success ? enParsed.data.eyebrow : tEn("eyebrow"),
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    eyebrowAr: arParsed?.success ? arParsed.data.eyebrow : tAr("eyebrow"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
  };

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
            Section text
          </h2>
          <p className="text-sm text-muted-foreground">
            The eyebrow, title, and subtitle shown above the video.
          </p>
        </div>
        <DoctorTestimonialsTextForm locale={locale} defaults={textDefaults} />
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
