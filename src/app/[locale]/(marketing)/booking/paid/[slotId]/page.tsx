import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { prisma } from "@/lib/prisma";
import { SlotStatus } from "@/generated/prisma/enums";
import { PaidBookingForm } from "@/components/booking/paid-booking-form";
import { APP_TIME_ZONE } from "@/lib/timezone";

export default async function ConfirmPaidSlotPage({
  params,
}: {
  params: Promise<{ locale: string; slotId: string }>;
}) {
  const { locale, slotId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.paid");
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });

  const formattedDate = slot
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: APP_TIME_ZONE,
      }).format(slot.startAt)
    : null;

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <BrandedCard
        title={t("confirmTitle")}
        description={formattedDate ?? undefined}
      >
        {!slot || slot.status !== SlotStatus.OPEN ? (
          <div className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertDescription>{t("slotNoLongerAvailable")}</AlertDescription>
            </Alert>
            <Button
              className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<Link href="/booking/paid" locale={locale} />}
            >
              {t("pickAnother")}
            </Button>
          </div>
        ) : (
          <PaidBookingForm locale={locale} slotId={slotId} />
        )}
      </BrandedCard>
    </PurpleGlowSection>
  );
}
