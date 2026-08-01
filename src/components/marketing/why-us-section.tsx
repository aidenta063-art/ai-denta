import { Stethoscope, TrendingUp, MessagesSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

const ICONS = [Stethoscope, TrendingUp, MessagesSquare] as const;

export async function WhyUsSection() {
  const t = await getTranslations("HomePage.whyUs");

  return (
    <section id="about" className="scroll-mt-24 bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-border bg-secondary px-4 py-1 text-sm font-medium text-primary">
            {t("eyebrow")}
          </span>
          <h2 className="max-w-2xl text-3xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const Icon = ICONS[i];
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {t(`items.${i}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`items.${i}.description`)}
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
