import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Eye, Users, CalendarCheck, Wallet } from "lucide-react";
import {
  getReportsSummary,
  getRecentBookingsForReport,
  lastNDaysRange,
  type ReportRange,
} from "@/services/analytics/reports.service";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cairoDateKey,
  daysBetweenInclusive,
  isValidDateKey,
  shiftDateKey,
} from "@/lib/date-range";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PrintReportButton } from "@/components/dashboard/print-report-button";
import { TrafficChart, BookingsChart } from "@/components/dashboard/reports-charts";
import { formatSlotTimeRange } from "@/lib/timezone";

const DEFAULT_REPORT_DAYS = 30;
const MAX_REPORT_DAYS = 366;
const PRESET_DAYS = [7, 30, 90] as const;

/** Resolves the report window from the URL, tolerating a missing side, a
 * reversed range, or a hand-edited value — always returns a valid range. */
function resolveRange(
  fromParam: string | undefined,
  toParam: string | undefined,
): ReportRange {
  const today = cairoDateKey(new Date());
  const hasFrom = isValidDateKey(fromParam);
  const hasTo = isValidDateKey(toParam);
  if (!hasFrom && !hasTo) return lastNDaysRange(DEFAULT_REPORT_DAYS);

  let to = hasTo ? toParam : today;
  let from = hasFrom ? fromParam : shiftDateKey(to, -(DEFAULT_REPORT_DAYS - 1));
  if (from > to) [from, to] = [to, from];
  if (daysBetweenInclusive(from, to) > MAX_REPORT_DAYS) {
    from = shiftDateKey(to, -(MAX_REPORT_DAYS - 1));
  }
  return { from, to };
}

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const sp = await searchParams;
  const range = resolveRange(sp.from, sp.to);
  const dayCount = daysBetweenInclusive(range.from, range.to);
  const activePreset =
    !sp.from && !sp.to ? DEFAULT_REPORT_DAYS : range.to === cairoDateKey(new Date())
      ? PRESET_DAYS.find((d) => d === dayCount)
      : undefined;

  const [{ series, topPages, totals }, recentBookings] = await Promise.all([
    getReportsSummary(range),
    getRecentBookingsForReport(range),
  ]);

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            {range.from} → {range.to} ({dayCount} {dayCount === 1 ? "day" : "days"})
          </p>
        </div>
        <PrintReportButton />
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm print:hidden">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" defaultValue={range.from} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" defaultValue={range.to} required />
          </div>
          <Button type="submit" size="sm">
            Apply
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_DAYS.map((days) => {
            const preset = lastNDaysRange(days);
            return (
              <Button
                key={days}
                size="sm"
                variant={activePreset === days ? "secondary" : "outline"}
                render={
                  <Link
                    href={{
                      pathname: "/dashboard/reports",
                      query: { from: preset.from, to: preset.to },
                    }}
                    locale={locale}
                  />
                }
              >
                Last {days} days
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unique Visitors" value={String(totals.uniqueVisitors)} Icon={Users} />
        <StatCard label="Page Views" value={String(totals.pageViews)} Icon={Eye} />
        <StatCard label="Bookings" value={String(totals.bookings)} Icon={CalendarCheck} />
        <StatCard
          label="Revenue"
          value={currencyFormatter.format(totals.revenueCents / 100)}
          Icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-medium text-card-foreground">Traffic</h2>
          <TrafficChart series={series} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-medium text-card-foreground">Bookings</h2>
          <BookingsChart series={series} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h2 className="font-medium text-card-foreground">Top Pages</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-4 py-2 text-start">Path</th>
                <th className="px-4 py-2 text-end">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPages.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                    No traffic recorded yet.
                  </td>
                </tr>
              )}
              {topPages.map((page) => (
                <tr key={page.path} className="border-t border-border">
                  <td className="px-4 py-2 text-card-foreground">{page.path}</td>
                  <td className="px-4 py-2 text-end text-muted-foreground">{page.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h2 className="font-medium text-card-foreground">Recent Bookings</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-4 py-2 text-start">Customer</th>
                <th className="px-4 py-2 text-start">Consultation</th>
                <th className="px-4 py-2 text-start">Date</th>
                <th className="px-4 py-2 text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                    No bookings in this period.
                  </td>
                </tr>
              )}
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-card-foreground">
                    {booking.guestName}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {booking.consultationType.nameEn}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {booking.slot ? (
                      formatSlotTimeRange(booking.slot.startAt, booking.slot.endAt, "en", {
                        dateStyle: "medium",
                      })
                    ) : (
                      <span className="italic">Waitlist</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
