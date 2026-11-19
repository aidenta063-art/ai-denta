import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { AutoplaySoundVideo } from "@/components/marketing/autoplay-sound-video";
import { getDoctorTestimonialVideo } from "@/services/content/cms.service";

/** A video of doctors talking about their experience, for trust — hidden
 * entirely until an admin uploads one (Dashboard > Content > Doctor
 * Testimonials Video). */
export async function DoctorTestimonialVideoSection() {
  const [t, video] = await Promise.all([
    getTranslations("HomePage.doctorTestimonials"),
    getDoctorTestimonialVideo(),
  ]);

  if (!video) return null;

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="mb-10 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        <ScrollReveal>
          <AutoplaySoundVideo videoUrl={video.url} className="w-full" autoplay={false} />
        </ScrollReveal>
      </div>
    </section>
  );
}
