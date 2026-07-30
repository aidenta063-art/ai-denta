import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { FreeBookingForm } from "@/components/booking/free-booking-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking.free" });
  return { title: t("title"), description: t("description") };
}

export default async function FreeBookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.free");

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <BrandedCard title={t("title")} description={t("description")}>
        <FreeBookingForm locale={locale} />
      </BrandedCard>
    </PurpleGlowSection>
  );
}
