import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import {
  DoctorCardsGrid,
  type DoctorCardData,
} from "@/components/marketing/doctor-cards-grid";
import { listActiveDoctors } from "@/services/doctors/doctor.service";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { DoctorServiceInput } from "@/lib/validation/doctor.schema";

export async function OurDoctorsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.doctors");
  const doctors = await listActiveDoctors();

  const cards: DoctorCardData[] = doctors.map((doctor) => ({
    id: doctor.id,
    name: localized(locale, doctor.nameEn, doctor.nameAr),
    location: localized(locale, doctor.locationEn, doctor.locationAr),
    story: localized(locale, doctor.storyEn, doctor.storyAr),
    instagramUrl: doctor.instagramUrl,
    photoUrl: doctor.photoMedia?.url ?? null,
    services: Array.isArray(doctor.services)
      ? (doctor.services as unknown as DoctorServiceInput[])
      : [],
  }));

  return (
    <section id="doctors" className="bg-background px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        {cards.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <ScrollReveal>
            <DoctorCardsGrid
              locale={locale}
              doctors={cards}
              labels={{
                viewStory: t("viewStory"),
                close: t("close"),
                successStoryLabel: t("successStoryLabel"),
                servicesLabel: t("servicesLabel"),
              }}
            />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
