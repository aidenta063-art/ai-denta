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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { prisma } from "@/lib/prisma";
import { SlotStatus } from "@/generated/prisma/enums";
import { PaidBookingForm } from "@/components/booking/paid-booking-form";

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
      }).format(slot.startAt)
    : null;

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("confirmTitle")}</CardTitle>
          {formattedDate && <CardDescription>{formattedDate}</CardDescription>}
        </CardHeader>
        <CardContent>
          {!slot || slot.status !== SlotStatus.OPEN ? (
            <div className="flex flex-col gap-4">
              <Alert variant="destructive">
                <AlertDescription>{t("slotNoLongerAvailable")}</AlertDescription>
              </Alert>
              <Button render={<Link href="/booking/paid" locale={locale} />}>
                {t("pickAnother")}
              </Button>
            </div>
          ) : (
            <PaidBookingForm locale={locale} slotId={slotId} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
