import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Gift, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { listConsultationTypes } from "@/services/content/cms.service";
import { ConsultationKind } from "@/generated/prisma/enums";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking.choice" });
  return { title: t("title"), description: t("description") };
}

export default async function BookingChoicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.choice");
  const tNav = await getTranslations("Nav");
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const consultationTypes = await listConsultationTypes();
  const paidType = consultationTypes.find(
    (c) => c.kind === ConsultationKind.PAID,
  );
  const paidPrice =
    paidType?.priceCents != null
      ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
          style: "currency",
          currency: paidType.currency,
          maximumFractionDigits: 0,
        }).format(paidType.priceCents / 100)
      : null;

  return (
    <PurpleGlowSection className="py-24 sm:py-28">
      <TrackMetaEvent
        event="ViewContent"
        params={{ content_name: "booking_choice" }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-3 px-2 text-center">
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-[#EDE3F5] backdrop-blur">
          {tNav("booking")}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-[#EDE3F5]/80">{t("description")}</p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-3xl border-2 border-[#7E00C9] bg-white shadow-2xl shadow-[#7E00C9]/30">
          <div
            className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
            aria-hidden
          />
          <div className="flex flex-1 flex-col gap-4 p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <Sparkles className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold text-[#251037]">
                {t("paidTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("paidDescription")}
              </p>
              {paidPrice && (
                <p className="mt-1 text-2xl font-bold text-[#7E00C9]">
                  {paidPrice}
                </p>
              )}
            </div>
            <Button
              className="mt-auto h-11 w-full gap-2 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<Link href="/booking/paid" locale={locale} />}
            >
              {t("paidCta")}
              <Arrow className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur">
          <div
            className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
            aria-hidden
          />
          <div className="flex flex-1 flex-col gap-4 p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <Gift className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold text-[#251037]">
                {t("freeTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("freeDescription")}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-auto h-11 w-full gap-2 border-border/80 bg-white text-base font-medium hover:bg-secondary/60"
              render={<Link href="/booking/free" locale={locale} />}
            >
              {t("freeCta")}
              <Arrow className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </PurpleGlowSection>
  );
}
