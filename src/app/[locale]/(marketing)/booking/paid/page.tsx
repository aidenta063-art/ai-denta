import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import {
  findAvailableDates,
  findEarliestAvailableDate,
  findOpenSlotsForDate,
} from "@/services/booking/availability";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { formatSlotTimeRange } from "@/lib/timezone";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";

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

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <TrackMetaEvent
        event="ViewContent"
        params={{ content_name: "paid_slot_picker" }}
      />
      <BrandedCard
        title={t("title")}
        description={t("description")}
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <Clock className="size-3.5" />
                {t("dateLabel")}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="h-10 border-border/80 text-xs sm:text-sm"
                    render={
                      <Link href={`/booking/paid/${slot.id}`} locale={locale} />
                    }
                  >
                    {formatSlotTimeRange(slot.startAt, slot.endAt, locale)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </BrandedCard>
    </PurpleGlowSection>
  );
}
