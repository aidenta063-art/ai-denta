import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Eye, Users, CalendarCheck, Wallet } from "lucide-react";
import {
  getReportsSummary,
  getRecentBookingsForReport,
} from "@/services/analytics/reports.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PrintReportButton } from "@/components/dashboard/print-report-button";
import { TrafficChart, BookingsChart } from "@/components/dashboard/reports-charts";
import { formatSlotTimeRange } from "@/lib/timezone";

const REPORT_DAYS = 30;

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [{ series, topPages, totals }, recentBookings] = await Promise.all([
    getReportsSummary(REPORT_DAYS),
    getRecentBookingsForReport(REPORT_DAYS),
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
          <p className="text-sm text-muted-foreground">Last {REPORT_DAYS} days</p>
        </div>
        <PrintReportButton />
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
