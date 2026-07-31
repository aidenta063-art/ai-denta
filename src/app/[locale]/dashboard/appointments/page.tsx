import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  getMonthSummary,
  listSlotsForDate,
} from "@/services/booking/appointments.service";
import {
  blockSlotAction,
  unblockSlotAction,
  deleteSlotAction,
} from "@/actions/dashboard/appointments/slot-actions";
import {
  markDayHolidayAction,
  unmarkDayHolidayAction,
} from "@/actions/dashboard/appointments/holidays";
import { SlotStatus } from "@/generated/prisma/enums";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatSlotTimeRange } from "@/lib/timezone";
import { AdminCalendar } from "@/components/dashboard/admin-calendar";
import { AddSlotForm } from "@/components/dashboard/add-slot-form";

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string; date?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const today = new Date();
  const sp = await searchParams;
  const year = sp.year ? Number(sp.year) : today.getFullYear();
  const month = sp.month ? Number(sp.month) : today.getMonth() + 1;
  const selectedDate = sp.date;

  const summaries = await getMonthSummary(year, month);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Appointments
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href="/dashboard/appointments/working-hours"
                locale={locale}
              />
            }
          >
            Working Hours
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href="/dashboard/appointments/holidays" locale={locale} />
            }
          >
            Holidays
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <AdminCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            summaries={summaries}
          />
          <div className="mt-2 flex flex-wrap gap-4 border-t border-border px-2 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary" /> Has open
              slots
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-blue-500" /> Fully
              booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="opacity-40 line-through">31</span> Holiday
            </span>
          </div>
        </div>

        {selectedDate ? (
          <DayPanel locale={locale} date={selectedDate} summaries={summaries} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-12 text-sm text-muted-foreground">
            Click a day on the calendar to manage its slots.
          </div>
        )}
      </div>
    </div>
  );
}

async function DayPanel({
  locale,
  date,
  summaries,
}: {
  locale: Locale;
  date: string;
  summaries: { date: string; isHoliday: boolean }[];
}) {
  const slots = await listSlotsForDate(date);
  const isHoliday = summaries.find((s) => s.date === date)?.isHoliday ?? false;

  const blockAction = blockSlotAction.bind(null, locale);
  const unblockAction = unblockSlotAction.bind(null, locale);
  const removeAction = deleteSlotAction.bind(null, locale);
  const markHoliday = markDayHolidayAction.bind(null, locale, date);
  const unmarkHoliday = unmarkDayHolidayAction.bind(null, locale, date);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-foreground">{date}</h2>
        <form action={isHoliday ? unmarkHoliday : markHoliday}>
          <Button size="sm" variant={isHoliday ? "outline" : "secondary"}>
            {isHoliday ? "Remove holiday" : "Mark as holiday"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <AddSlotForm locale={locale} date={date} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Time</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Booked by</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No slots on this date.
                </td>
              </tr>
            )}
            {slots.map((slot) => (
              <tr
                key={slot.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 text-card-foreground">
                  {formatSlotTimeRange(slot.startAt, slot.endAt, "en")}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={slot.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {slot.booking?.guestName ?? "—"}
                </td>
                <td className="px-4 py-2 text-end">
                  <div className="flex justify-end gap-2">
                    {slot.status === SlotStatus.OPEN && (
                      <form action={blockAction.bind(null, slot.id)}>
                        <Button size="sm" variant="outline" type="submit">
                          Block
                        </Button>
                      </form>
                    )}
                    {slot.status === SlotStatus.BLOCKED && (
                      <form action={unblockAction.bind(null, slot.id)}>
                        <Button size="sm" variant="outline" type="submit">
                          Unblock
                        </Button>
                      </form>
                    )}
                    {(slot.status === SlotStatus.OPEN ||
                      slot.status === SlotStatus.BLOCKED) && (
                      <form action={removeAction.bind(null, slot.id)}>
                        <Button size="sm" variant="destructive" type="submit">
                          Delete
                        </Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
