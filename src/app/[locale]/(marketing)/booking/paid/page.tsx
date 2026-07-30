import type { Metadata } from "next";
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
import {
  findAvailableDates,
  findEarliestAvailableDate,
  findOpenSlotsForDate,
} from "@/services/booking/availability";
import { BookingCalendar } from "@/components/booking/booking-calendar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking.paid" });
  return { title: t("title"), description: t("description") };
}

export default async function PaidBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.paid");
  const { date: requestedDate } = await searchParams;
  const [date, availableDates] = await Promise.all([
    requestedDate ?? findEarliestAvailableDate(),
    findAvailableDates(),
  ]);

  const slots = date ? await findOpenSlotsForDate(date) : [];

  const timeFormatter = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { timeStyle: "short" },
  );

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {availableDates.size === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
          ) : (
            <BookingCalendar
              locale={locale}
              selectedDate={date ?? undefined}
              availableDates={[...availableDates]}
            />
          )}

          {date && slots.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("noSlotsForDate")}
            </p>
          )}

          {slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  render={
                    <Link href={`/booking/paid/${slot.id}`} locale={locale} />
                  }
                >
                  {timeFormatter.format(slot.startAt)}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
