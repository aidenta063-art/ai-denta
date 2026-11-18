import { Stethoscope, TrendingUp, MessagesSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { getWhyUsContent } from "@/services/content/cms.service";
import { whyUsContentSchema } from "@/lib/validation/cms.schema";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

const ICONS = [Stethoscope, TrendingUp, MessagesSquare] as const;

export async function WhyUsSection({ locale }: { locale: Locale }) {
  const [t, section] = await Promise.all([
    getTranslations("HomePage.whyUs"),
    getWhyUsContent(),
  ]);

  const parsed = section
    ? whyUsContentSchema.safeParse(
        localized(locale, section.contentEn, section.contentAr),
      )
    : null;

  const content = parsed?.success
    ? parsed.data
    : {
        eyebrow: t("eyebrow"),
        title: t("title"),
        subtitle: t("subtitle"),
        items: [0, 1, 2].map((i) => ({
          title: t(`items.${i}.title`),
          description: t(`items.${i}.description`),
        })),
      };

  return (
    <section id="about" className="scroll-mt-24 bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{content.subtitle}</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {content.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
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
