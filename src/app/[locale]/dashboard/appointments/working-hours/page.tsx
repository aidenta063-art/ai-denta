import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { listWeeklySchedule } from "@/services/booking/appointments.service";
import { WorkingHoursDayRow } from "@/components/dashboard/working-hours-day-row";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function WorkingHoursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const schedule = await listWeeklySchedule();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Working Hours
          </h1>
          <p className="text-sm text-muted-foreground">
            Set your weekly schedule — one row per day. Changes apply
            immediately to the public booking calendar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/appointments" locale={locale} />}
        >
          Back to appointments
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[7rem_1fr_1fr_5rem_auto_auto] items-center gap-3 bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground">
          <span>Day</span>
          <span>Start</span>
          <span>End</span>
          <span>Slot (min)</span>
          <span>Closed</span>
          <span />
        </div>
        {schedule.map(({ weekday, rule }) => (
          <WorkingHoursDayRow
            key={weekday}
            locale={locale}
            weekday={weekday}
            dayLabel={WEEKDAY_NAMES[weekday]}
            rule={rule}
          />
        ))}
      </div>
    </div>
  );
}
