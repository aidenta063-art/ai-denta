import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { PaymentPanel } from "@/components/payment/payment-panel";
import { prisma } from "@/lib/prisma";
import { localized } from "@/lib/i18n-content";
import { formatSlotTimeRange } from "@/lib/timezone";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";
import { requireOwnerOrStaff } from "@/lib/authz";
import { Role, BookingStatus } from "@/generated/prisma/enums";

export default async function PaymentPendingPage({
  params,
}: {
  params: Promise<{ locale: string; bookingId: string }>;
}) {
  const { locale, bookingId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.paid");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true, consultationType: true, payment: true },
  });

  if (!booking || !booking.slot) notFound();

  await requireOwnerOrStaff(booking.userId, [Role.ADMIN, Role.STAFF], locale);

  const isConfirmed = booking.status === BookingStatus.CONFIRMED;

  const formattedDate = formatSlotTimeRange(
    booking.slot.startAt,
    booking.slot.endAt,
    locale,
    { dateStyle: "full" },
  );

  const formattedPrice = booking.payment
    ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: booking.payment.currency,
      }).format(booking.payment.amountCents / 100)
    : null;

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <TrackMetaEvent event="Schedule" />
      {isConfirmed ? (
        <TrackMetaEvent
          event="Purchase"
          params={
            booking.payment
              ? {
                  value: booking.payment.amountCents / 100,
                  currency: booking.payment.currency,
                  content_name: "paid_consultation",
                }
              : { content_name: "paid_consultation" }
          }
        />
      ) : (
        <TrackMetaEvent
          event="AddPaymentInfo"
          params={{ content_name: "paid_consultation" }}
        />
      )}
      <BrandedCard
        title={isConfirmed ? t("confirmedTitle") : t("pendingTitle")}
        description={
          isConfirmed ? t("confirmedDescription") : t("pendingDescription")
        }
        className={isConfirmed ? undefined : "max-w-xl lg:max-w-2xl"}
      >
        <div className="flex flex-col gap-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            {isConfirmed ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <Clock className="size-6" />
            )}
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
              <p className="text-sm text-muted-foreground">{t("dateLabel")}</p>
              <p className="font-medium text-foreground">{formattedDate}</p>
            </div>
            {isConfirmed && formattedPrice && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("priceLabel")}
                </p>
                <p className="font-medium text-foreground">{formattedPrice}</p>
              </div>
            )}
          </div>

          {isConfirmed ? (
            <Button
              className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<Link href="/" locale={locale} />}
            >
              {t("backHome")}
            </Button>
          ) : (
            formattedPrice && (
              <PaymentPanel
                kind="booking"
                amountLabel={formattedPrice}
                reference={booking.id.slice(-8)}
              />
            )
          )}
        </div>
      </BrandedCard>
    </PurpleGlowSection>
  );
}
