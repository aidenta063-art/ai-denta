"use client";

import { useRouter } from "@/i18n/navigation";
import { Calendar } from "@/components/ui/calendar";

export interface DaySummary {
  date: string;
  open: number;
  booked: number;
  blocked: number;
  isHoliday: boolean;
}

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

export function AdminCalendar({
  year,
  month,
  selectedDate,
  summaries,
}: {
  year: number;
  month: number;
  selectedDate?: string;
  summaries: DaySummary[];
}) {
  const router = useRouter();
  const summaryByDate = new Map(summaries.map((s) => [s.date, s]));

  function navigate(newYear: number, newMonth: number, newDate?: string) {
    const params = new URLSearchParams();
    params.set("year", String(newYear));
    params.set("month", String(newMonth));
    if (newDate) params.set("date", newDate);
    router.push(`/dashboard/appointments?${params.toString()}`);
  }

  return (
    <Calendar
      mode="single"
      month={new Date(year, month - 1, 1)}
      onMonthChange={(date) =>
        navigate(date.getFullYear(), date.getMonth() + 1)
      }
      selected={selectedDate ? parseDate(selectedDate) : undefined}
      onSelect={(date) => {
        if (!date) return;
        navigate(date.getFullYear(), date.getMonth() + 1, formatDate(date));
      }}
      className="w-full [--cell-size:--spacing(11)]"
      modifiers={{
        hasOpen: (date) => (summaryByDate.get(formatDate(date))?.open ?? 0) > 0,
        holiday: (date) => summaryByDate.get(formatDate(date))?.isHoliday ?? false,
        bookedOnly: (date) => {
          const s = summaryByDate.get(formatDate(date));
          return !!s && s.open === 0 && s.booked > 0;
        },
      }}
      modifiersClassNames={{
        hasOpen: "after:absolute after:bottom-1 after:size-1.5 after:rounded-full after:bg-primary",
        bookedOnly: "after:absolute after:bottom-1 after:size-1.5 after:rounded-full after:bg-blue-500",
        holiday: "opacity-40 line-through",
      }}
    />
  );
}
