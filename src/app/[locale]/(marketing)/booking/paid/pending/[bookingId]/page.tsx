import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { localized } from "@/lib/i18n-content";

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

  if (!booking) notFound();

  const formattedDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { dateStyle: "full", timeStyle: "short" },
  ).format(booking.slot.startAt);

  const formattedPrice = booking.payment
    ? new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: booking.payment.currency,
      }).format(booking.payment.amountCents / 100)
    : null;

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("pendingTitle")}</CardTitle>
          <CardDescription>{t("pendingDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
          {formattedPrice && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("priceLabel")}
              </p>
              <p className="font-medium text-foreground">{formattedPrice}</p>
            </div>
          )}
          <Button render={<Link href="/" locale={locale} />}>
            {t("backHome")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
