import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { listActiveDoctors } from "@/services/doctors/doctor.service";
import { localized } from "@/lib/i18n-content";
import { getDoctorServiceIcon } from "@/lib/doctor-service-icon";
import type { Locale } from "@/i18n/routing";
import type { DoctorServiceInput } from "@/lib/validation/doctor.schema";

export async function OurDoctorsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.doctors");
  const doctors = await listActiveDoctors();

  return (
    <section id="doctors" className="scroll-mt-24 bg-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-border bg-secondary px-4 py-1 text-sm font-medium text-primary">
            {t("eyebrow")}
          </span>
          <h2 className="max-w-2xl text-3xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        {doctors.length === 0 && (
          <p className="text-center text-muted-foreground">{t("empty")}</p>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor, i) => {
            const services = Array.isArray(doctor.services)
              ? (doctor.services as unknown as DoctorServiceInput[])
              : [];
            const name = localized(locale, doctor.nameEn, doctor.nameAr);

            return (
              <ScrollReveal key={doctor.id} delay={Math.min(i, 3) * 0.1}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                    {doctor.photoMedia ? (
                      <Image
                        src={doctor.photoMedia.url}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#7E00C9]/20 to-[#B98AE8]/20 text-4xl font-bold text-primary/40">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">
                        {name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0 text-primary" />
                        {localized(locale, doctor.locationEn, doctor.locationAr)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                        {t("successStoryLabel")}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {localized(locale, doctor.storyEn, doctor.storyAr)}
                      </p>
                    </div>

                    {services.length > 0 && (
                      <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                          {t("servicesLabel")}
                        </span>
                        <div className="flex flex-col gap-2">
                          {services.map((service, si) => {
                            const Icon = getDoctorServiceIcon(service.nameEn);
                            return (
                              <div
                                key={si}
                                className="flex gap-2.5 rounded-xl bg-secondary/50 p-3"
                              >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                                  <Icon className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold text-card-foreground">
                                    {localized(
                                      locale,
                                      service.nameEn,
                                      service.nameAr,
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {localized(
                                      locale,
                                      service.descriptionEn,
                                      service.descriptionAr,
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
