import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { ScheduleGridBackdrop } from "@/components/marketing/schedule-grid-backdrop";
import { listConsultationTypes } from "@/services/content/cms.service";
import { formatDiscountedPrice } from "@/lib/pricing";
import { ConsultationKind } from "@/generated/prisma/enums";
import { localized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export async function ConsultationCta({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.cta");
  const consultationTypes = await listConsultationTypes();
  const paidType = consultationTypes.find(
    (c) => c.kind === ConsultationKind.PAID,
  );
  const freeType = consultationTypes.find(
    (c) => c.kind === ConsultationKind.FREE,
  );
  const showFree = freeType?.isActive ?? true;
  const paidName = paidType
    ? localized(locale, paidType.nameEn, paidType.nameAr)
    : locale === "ar"
      ? "استشارة مدفوعة"
      : "Paid Consultation";
  const freeName = freeType
    ? localized(locale, freeType.nameEn, freeType.nameAr)
    : locale === "ar"
      ? "استشارة مجانية"
      : "Free Consultation";
  const paidPrice =
    paidType?.priceCents != null
      ? formatDiscountedPrice({
          priceCents: paidType.priceCents,
          discountEnabled: paidType.discountEnabled,
          discountType: paidType.discountType,
          discountValue: paidType.discountValue,
          currency: paidType.currency,
          locale,
        })
      : null;

  return (
    <section className="px-6 py-20">
      <ScrollReveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#7E00C9] to-[#251037] px-8 py-14 text-center sm:px-16">
        <ScheduleGridBackdrop className="pointer-events-none absolute -top-3 -right-3 hidden opacity-30 sm:grid" />
        <h2 className="relative z-10 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="relative z-10 mx-auto mt-3 max-w-xl text-[#EDE3F5]/80">
          {t("subtitle")}
        </p>
        <div className="relative z-10 mt-8 flex flex-wrap items-start justify-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <Button
              size="lg"
              className="bg-white text-base text-[#251037] shadow-xl shadow-black/20 hover:bg-white/90"
              render={<Link href="/booking/paid" locale={locale} />}
            >
              {paidName}
            </Button>
            {paidPrice && (
              <p className="flex items-baseline gap-1.5 text-sm">
                <span className="font-semibold text-white">
                  {paidPrice.finalLabel}
                </span>
                {paidPrice.originalLabel && (
                  <span className="text-xs text-[#EDE3F5]/50 line-through">
                    {paidPrice.originalLabel}
                  </span>
                )}
              </p>
            )}
          </div>
          {showFree && (
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              render={<Link href="/booking/free" locale={locale} />}
            >
              {freeName}
            </Button>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
