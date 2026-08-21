import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingPaidThankYouContent } from "@/services/content/cms.service";
import { BookingPaidThankYouForm } from "@/components/dashboard/booking-paid-thankyou-form";
import { bookingPaidThankYouContentSchema } from "@/lib/validation/cms.schema";

export default async function BookingPaidThankYouContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [section, tEn, tAr] = await Promise.all([
    getBookingPaidThankYouContent(),
    getTranslations({ locale: "en", namespace: "Booking.paid" }),
    getTranslations({ locale: "ar", namespace: "Booking.paid" }),
  ]);

  const enParsed = section
    ? bookingPaidThankYouContentSchema.safeParse(section.contentEn)
    : null;
  const arParsed = section
    ? bookingPaidThankYouContentSchema.safeParse(section.contentAr)
    : null;

  const defaults = {
    pendingTitleEn: enParsed?.success ? enParsed.data.pendingTitle : tEn("pendingTitle"),
    pendingDescriptionEn: enParsed?.success ? enParsed.data.pendingDescription : tEn("pendingDescription"),
    confirmedTitleEn: enParsed?.success ? enParsed.data.confirmedTitle : tEn("confirmedTitle"),
    confirmedDescriptionEn: enParsed?.success ? enParsed.data.confirmedDescription : tEn("confirmedDescription"),
    consultationLabelEn: enParsed?.success ? enParsed.data.consultationLabel : tEn("consultationLabel"),
    dateLabelEn: enParsed?.success ? enParsed.data.dateLabel : tEn("dateLabel"),
    priceLabelEn: enParsed?.success ? enParsed.data.priceLabel : tEn("priceLabel"),
    backHomeEn: enParsed?.success ? enParsed.data.backHome : tEn("backHome"),
    upsellBadgeEn: enParsed?.success ? enParsed.data.upsell.badge : tEn("upsell.badge"),
    upsellTitleEn: enParsed?.success ? enParsed.data.upsell.title : tEn("upsell.title"),
    upsellDescriptionEn: enParsed?.success ? enParsed.data.upsell.description : tEn("upsell.description"),
    upsellBonusEn: enParsed?.success ? enParsed.data.upsell.bonus : tEn("upsell.bonus"),
    upsellCtaEn: enParsed?.success ? enParsed.data.upsell.cta : tEn("upsell.cta"),
    pendingTitleAr: arParsed?.success ? arParsed.data.pendingTitle : tAr("pendingTitle"),
    pendingDescriptionAr: arParsed?.success ? arParsed.data.pendingDescription : tAr("pendingDescription"),
    confirmedTitleAr: arParsed?.success ? arParsed.data.confirmedTitle : tAr("confirmedTitle"),
    confirmedDescriptionAr: arParsed?.success ? arParsed.data.confirmedDescription : tAr("confirmedDescription"),
    consultationLabelAr: arParsed?.success ? arParsed.data.consultationLabel : tAr("consultationLabel"),
    dateLabelAr: arParsed?.success ? arParsed.data.dateLabel : tAr("dateLabel"),
    priceLabelAr: arParsed?.success ? arParsed.data.priceLabel : tAr("priceLabel"),
    backHomeAr: arParsed?.success ? arParsed.data.backHome : tAr("backHome"),
    upsellBadgeAr: arParsed?.success ? arParsed.data.upsell.badge : tAr("upsell.badge"),
    upsellTitleAr: arParsed?.success ? arParsed.data.upsell.title : tAr("upsell.title"),
    upsellDescriptionAr: arParsed?.success ? arParsed.data.upsell.description : tAr("upsell.description"),
    upsellBonusAr: arParsed?.success ? arParsed.data.upsell.bonus : tAr("upsell.bonus"),
    upsellCtaAr: arParsed?.success ? arParsed.data.upsell.cta : tAr("upsell.cta"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Paid Booking Thank-You Page
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Copy shown after a paid consultation is booked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingPaidThankYouForm locale={locale} defaults={defaults} />
        </CardContent>
      </Card>
    </div>
  );
}
