import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { AutoplaySoundVideo } from "@/components/marketing/autoplay-sound-video";
import {
  getDoctorTestimonialVideo,
  getDoctorTestimonialsContent,
} from "@/services/content/cms.service";
import { doctorTestimonialsContentSchema } from "@/lib/validation/cms.schema";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

/** A video of doctors talking about their experience, for trust — hidden
 * entirely until an admin uploads one (Dashboard > Content > Doctor
 * Testimonials Video). */
export async function DoctorTestimonialVideoSection({
  locale,
}: {
  locale: Locale;
}) {
  const [t, video, section] = await Promise.all([
    getTranslations("HomePage.doctorTestimonials"),
    getDoctorTestimonialVideo(),
    getDoctorTestimonialsContent(),
  ]);

  if (!video) return null;

  const parsed = section
    ? doctorTestimonialsContentSchema.safeParse(
        localized(locale, section.contentEn, section.contentAr),
      )
    : null;
  const content = parsed?.success
    ? parsed.data
    : { eyebrow: t("eyebrow"), title: t("title"), subtitle: t("subtitle") };

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="mb-10 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="max-w-xl text-muted-foreground">{content.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <AutoplaySoundVideo videoUrl={video.url} className="w-full" autoplay={false} />
        </ScrollReveal>
      </div>
    </section>
  );
}
