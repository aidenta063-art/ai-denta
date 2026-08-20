import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PartyPopper, Clock, Gift, ArrowRight } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { PaymentMethodSwitcher } from "@/components/payment/payment-method-switcher";
import { prisma } from "@/lib/prisma";
import { localized } from "@/lib/i18n-content";
import { formatSlotTimeRange } from "@/lib/timezone";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";
import { requireOwnerOrStaff } from "@/lib/authz";
import { Role, BookingStatus, PaymentProviderName } from "@/generated/prisma/enums";
import { KashierProvider } from "@/services/payments/providers/kashier.provider";
import { confirmBookingPaymentFromGateway } from "@/services/payments/payments-admin.service";
import { logger } from "@/lib/logger";

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
    include: { slot: true, consultationType: true, payment: true, user: true },
  });

  if (!booking || !booking.slot) notFound();

  await requireOwnerOrStaff(booking.userId, [Role.ADMIN, Role.STAFF], locale);

  let isConfirmed = booking.status === BookingStatus.CONFIRMED;

  // Fallback for a delayed or lost webhook: if we already have a Kashier
  // session on file for this payment, check its real status directly
  // before assuming it's still pending — this is what catches a charge
  // that actually succeeded but whose webhook never arrived.
  if (!isConfirmed && booking.payment?.providerRefId) {
    try {
      const result = await new KashierProvider().verify(
        booking.payment.providerRefId,
      );
      if (result.status === "PAID") {
        await confirmBookingPaymentFromGateway({
          paymentId: booking.payment.id,
          provider: PaymentProviderName.KASHIER,
          providerRefId: booking.payment.providerRefId,
          providerPayload: { source: "redirect-verify" },
          amountCents: result.amountCents ?? booking.payment.amountCents,
        });
        isConfirmed = true;
      }
    } catch (error) {
      logger.error(
        { err: error, bookingId },
        "Failed to verify Kashier session status on redirect",
      );
    }
  }

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

  let kashierSessionUrl: string | null = null;
  if (!isConfirmed && booking.payment) {
    try {
      const session = await new KashierProvider().createSession({
        referenceId: booking.payment.id,
        referenceType: "booking",
        amountCents: booking.payment.amountCents,
        currency: booking.payment.currency,
        customerName: booking.guestName ?? booking.user?.name ?? undefined,
        customerEmail: booking.guestEmail ?? booking.user?.email ?? undefined,
        redirectUrl: `${process.env.APP_URL}/${locale}/booking/paid/pending/${bookingId}`,
      });
      kashierSessionUrl = session.redirectUrl;
      if (session.providerRefId) {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: { providerRefId: session.providerRefId },
        });
      }
    } catch (error) {
      logger.error(
        { err: error, bookingId },
        "Failed to create Kashier session for booking payment",
      );
    }
  }

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
              <PartyPopper className="size-6" />
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
            <>
              <Button
                className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
                render={<Link href="/" locale={locale} />}
              >
                {t("backHome")}
              </Button>

              <div className="flex flex-col gap-3 rounded-2xl border border-[#7E00C9]/20 bg-gradient-to-br from-[#7E00C9]/5 to-transparent p-4">
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-[#7E00C9]/10 px-3 py-1 text-xs font-semibold text-[#7E00C9]">
                  <Gift className="size-3.5" />
                  {t("upsell.badge")}
                </span>
                <p className="text-sm font-semibold text-[#7E00C9]">
                  {t("upsell.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("upsell.description")}
                </p>
                <p className="text-sm font-medium text-[#7E00C9]">
                  {t("upsell.bonus")}
                </p>
                <Button
                  variant="outline"
                  className="h-10 w-fit gap-2 border-[#7E00C9]/40 text-[#7E00C9] hover:bg-[#7E00C9]/10"
                  render={<Link href="/ebook" locale={locale} />}
                >
                  {t("upsell.cta")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </>
          ) : (
            formattedPrice && (
              <PaymentMethodSwitcher
                kind="booking"
                amountLabel={formattedPrice}
                reference={booking.id.slice(-8)}
                sessionUrl={kashierSessionUrl}
              />
            )
          )}
        </div>
      </BrandedCard>
    </PurpleGlowSection>
  );
}
