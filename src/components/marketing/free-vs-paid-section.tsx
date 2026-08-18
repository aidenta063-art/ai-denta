import { getTranslations } from "next-intl/server";
import { Check, Minus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { formatConsultationPrice } from "@/lib/pricing";
import {
  listComparisonRows,
  listConsultationTypes,
  getComparisonHeaderContent,
} from "@/services/content/cms.service";
import { comparisonHeaderContentSchema } from "@/lib/validation/cms.schema";
import { ConsultationKind } from "@/generated/prisma/enums";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

function Row({
  label,
  free,
  paid,
  last,
}: {
  label: string;
  free: React.ReactNode;
  paid: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-3 items-center ${last ? "" : "border-b border-border"}`}
    >
      <div className="p-4 text-sm font-medium text-muted-foreground sm:p-6">
        {label}
      </div>
      <div className="p-4 text-center text-sm text-card-foreground sm:p-6">
        {free}
      </div>
      <div className="border-s-2 border-[#7E00C9]/20 bg-secondary/40 p-4 text-center text-sm font-medium text-card-foreground sm:p-6">
        {paid}
      </div>
    </div>
  );
}

export async function FreeVsPaidSection({ locale }: { locale: Locale }) {
  const [t, tCta, customRows, consultationTypes, headerSection] =
    await Promise.all([
      getTranslations("HomePage.comparison"),
      getTranslations("HomePage.cta"),
      listComparisonRows(),
      listConsultationTypes(),
      getComparisonHeaderContent(),
    ]);

  const headerParsed = headerSection
    ? comparisonHeaderContentSchema.safeParse(
        localized(locale, headerSection.contentEn, headerSection.contentAr),
      )
    : null;
  const header = headerParsed?.success
    ? headerParsed.data
    : {
        eyebrow: t("eyebrow"),
        title: t("title"),
        subtitle: t("subtitle"),
        featureLabel: t("featureLabel"),
        freeName: t("freeName"),
        paidName: t("paidName"),
        mostPopular: t("mostPopular"),
      };

  const freeType =
    consultationTypes.find((c) => c.kind === ConsultationKind.FREE) ?? null;
  const paidType =
    consultationTypes.find((c) => c.kind === ConsultationKind.PAID) ?? null;

  const paidPrice =
    paidType?.priceCents != null
      ? formatConsultationPrice({
          priceCents: paidType.priceCents,
          discountEnabled: paidType.discountEnabled,
          discountType: paidType.discountType,
          discountValue: paidType.discountValue,
          currency: paidType.currency,
          locale,
        })
      : null;

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-10 flex flex-col items-center gap-2 text-center">
          <Eyebrow>{header.eyebrow}</Eyebrow>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-foreground">
            {header.title}
          </h2>
          <p className="max-w-xl text-muted-foreground">{header.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border border-border">
            <div className="grid grid-cols-3 bg-[#251037]">
              <div className="flex flex-col justify-center p-4 sm:p-6">
                <p className="text-xs font-medium text-white/60 uppercase">
                  {header.featureLabel}
                </p>
              </div>
              <div className="flex flex-col justify-center p-4 text-center sm:p-6">
                <p className="font-semibold text-white">{header.freeName}</p>
              </div>
              <div className="relative flex flex-col items-center gap-1.5 border-s-2 border-white/20 bg-[#7E00C9] p-4 sm:p-6">
                <span className="rounded-full bg-white px-3 py-0.5 text-[10px] font-semibold text-[#7E00C9] uppercase">
                  {header.mostPopular}
                </span>
                <p className="font-semibold text-white">{header.paidName}</p>
              </div>
            </div>

            {customRows.length > 0 ? (
              customRows.map((row, i) => (
                <Row
                  key={row.id}
                  label={localized(locale, row.labelEn, row.labelAr)}
                  free={localized(locale, row.freeValueEn, row.freeValueAr)}
                  paid={localized(locale, row.paidValueEn, row.paidValueAr)}
                  last={i === customRows.length - 1}
                />
              ))
            ) : (
              <>
                <Row
                  label={t("schedulingLabel")}
                  free={t("schedulingFree")}
                  paid={t("schedulingPaid")}
                />
                <Row
                  label={t("durationLabel")}
                  free={t("durationValue", {
                    minutes: freeType?.durationMinutes ?? 20,
                  })}
                  paid={t("durationValue", {
                    minutes: paidType?.durationMinutes ?? 45,
                  })}
                />
                <Row
                  label={t("depthLabel")}
                  free={t("depthFree")}
                  paid={t("depthPaid")}
                />
                <Row
                  label={t("priorityLabel")}
                  free={
                    <Minus className="mx-auto size-4 text-muted-foreground/60" />
                  }
                  paid={<Check className="mx-auto size-4 text-[#7E00C9]" />}
                />
                <Row
                  label={t("priceLabel")}
                  free={t("freePrice")}
                  paid={
                    paidPrice ? (
                      <span className="flex items-baseline justify-center gap-2">
                        <span>{paidPrice.finalLabel}</span>
                        {paidPrice.originalLabel && (
                          <span className="text-xs font-normal text-muted-foreground line-through">
                            {paidPrice.originalLabel}
                          </span>
                        )}
                      </span>
                    ) : null
                  }
                  last
                />
              </>
            )}

            <div className="grid grid-cols-3 border-t border-border bg-secondary/20 p-4 sm:p-6">
              <div />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="h-10 w-full max-w-48"
                  render={<Link href="/booking/free" locale={locale} />}
                >
                  {tCta("ctaFree")}
                </Button>
              </div>
              <div className="flex flex-col items-center gap-1.5 border-s-2 border-[#7E00C9]/20 ps-4 sm:ps-6">
                <Button
                  className="h-10 w-full max-w-48 bg-[#7E00C9] hover:bg-[#7E00C9]/90"
                  render={<Link href="/booking/paid" locale={locale} />}
                >
                  {tCta("ctaPaid")}
                </Button>
                {paidPrice && (
                  <p className="flex items-baseline gap-1.5 text-xs">
                    <span className="font-semibold text-foreground">
                      {paidPrice.finalLabel}
                    </span>
                    {paidPrice.originalLabel && (
                      <span className="text-muted-foreground line-through">
                        {paidPrice.originalLabel}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
