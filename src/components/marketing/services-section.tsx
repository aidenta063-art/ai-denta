import { Sparkles, Video, Megaphone, LineChart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { listServices } from "@/services/content/cms.service";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

const FALLBACK_ICONS = [Video, Megaphone, LineChart] as const;

export async function ServicesSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.services");
  const dbServices = await listServices();

  const services =
    dbServices.length > 0
      ? dbServices.map((service) => ({
          key: service.id,
          title: localized(locale, service.nameEn, service.nameAr),
          description: localized(
            locale,
            service.descriptionEn,
            service.descriptionAr,
          ),
        }))
      : [0, 1, 2].map((i) => ({
          key: `fallback-${i}`,
          title: t(`items.${i}.title`),
          description: t(`items.${i}.description`),
        }));

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {services.map((service, i) => {
            const Icon = FALLBACK_ICONS[i % FALLBACK_ICONS.length] ?? Sparkles;
            return (
              <ScrollReveal key={service.key} delay={i * 0.1}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
