"use client";

import { ar } from "date-fns/locale";
import { useRouter } from "@/i18n/navigation";
import { Calendar } from "@/components/ui/calendar";
import type { Locale } from "@/i18n/routing";

function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function BookingCalendar({
  locale,
  selectedDate,
  availableDates,
}: {
  locale: Locale;
  selectedDate?: string;
  availableDates: string[];
}) {
  const router = useRouter();
  const availableSet = new Set(availableDates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Calendar
      mode="single"
      locale={locale === "ar" ? ar : undefined}
      dir={locale === "ar" ? "rtl" : "ltr"}
      defaultMonth={selectedDate ? parseDate(selectedDate) : undefined}
      selected={selectedDate ? parseDate(selectedDate) : undefined}
      onSelect={(date) => {
        if (!date) return;
        router.push(`/booking/paid?date=${formatDate(date)}`);
      }}
      disabled={(date) => date < today || !availableSet.has(formatDate(date))}
      modifiers={{
        available: (date) => availableSet.has(formatDate(date)),
      }}
      modifiersClassNames={{
        available:
          "font-semibold text-primary after:absolute after:bottom-1 after:size-1.5 after:rounded-full after:bg-primary",
      }}
      className="mx-auto w-fit [--cell-size:--spacing(10)]"
    />
  );
}
