import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { prisma } from "@/lib/prisma";
import { localized } from "@/lib/i18n-content";
import { APP_TIME_ZONE } from "@/lib/timezone";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; bookingId: string }>;
}) {
  const { locale, bookingId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.confirmation");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true, consultationType: true },
  });

  if (!booking) notFound();

  const formattedDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { dateStyle: "full", timeStyle: "short", timeZone: APP_TIME_ZONE },
  ).format(booking.slot.startAt);

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <BrandedCard title={t("title")} description={t("description")}>
        <div className="flex flex-col gap-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <CheckCircle2 className="size-6" />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-secondary/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("consultationLabel")}
              </p>
              <p className="font-medium text-foreground">
                {localized(
                  locale,
                  booking.consultationType.nameEn,
                  booking.consultationType.nameAr,
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("dateLabel")}
              </p>
              <p className="font-medium text-foreground">{formattedDate}</p>
            </div>
          </div>

          <Button
            className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
            render={<Link href="/" locale={locale} />}
          >
            {t("backHome")}
          </Button>
        </div>
      </BrandedCard>
    </PurpleGlowSection>
  );
}
