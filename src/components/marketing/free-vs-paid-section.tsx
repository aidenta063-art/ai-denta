import { getTranslations } from "next-intl/server";
import { Check, Minus } from "lucide-react";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { formatConsultationPrice } from "@/lib/pricing";
import type { Locale } from "@/i18n/routing";
import type { DiscountType } from "@/generated/prisma/enums";

type ConsultationSummary = {
  durationMinutes: number;
  priceCents: number | null;
  currency: string;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
};

function ComparisonRow({
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
      <div className="bg-secondary/40 p-4 text-center text-sm font-medium text-card-foreground sm:p-6">
        {paid}
      </div>
    </div>
  );
}

export async function FreeVsPaidSection({
  locale,
  freeType,
  paidType,
}: {
  locale: Locale;
  freeType: ConsultationSummary | null;
  paidType: ConsultationSummary | null;
}) {
  const t = await getTranslations("HomePage.comparison");

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
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border border-border">
            <div className="grid grid-cols-3 bg-[#251037]">
              <div className="flex flex-col justify-center p-4 sm:p-6">
                <p className="text-xs font-medium text-white/60 uppercase">
                  {t("featureLabel")}
                </p>
              </div>
              <div className="flex flex-col justify-center p-4 text-center sm:p-6">
                <p className="font-semibold text-white">{t("freeName")}</p>
              </div>
              <div className="relative flex flex-col items-center gap-1.5 bg-[#7E00C9] p-4 sm:p-6">
                <span className="rounded-full bg-white px-3 py-0.5 text-[10px] font-semibold text-[#7E00C9] uppercase">
                  {t("mostPopular")}
                </span>
                <p className="font-semibold text-white">{t("paidName")}</p>
              </div>
            </div>

            <ComparisonRow
              label={t("schedulingLabel")}
              free={t("schedulingFree")}
              paid={t("schedulingPaid")}
            />
            <ComparisonRow
              label={t("durationLabel")}
              free={t("durationValue", { minutes: freeType?.durationMinutes ?? 20 })}
              paid={t("durationValue", { minutes: paidType?.durationMinutes ?? 45 })}
            />
            <ComparisonRow
              label={t("depthLabel")}
              free={t("depthFree")}
              paid={t("depthPaid")}
            />
            <ComparisonRow
              label={t("priorityLabel")}
              free={<Minus className="mx-auto size-4 text-muted-foreground/60" />}
              paid={<Check className="mx-auto size-4 text-[#7E00C9]" />}
            />
            <ComparisonRow
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
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
