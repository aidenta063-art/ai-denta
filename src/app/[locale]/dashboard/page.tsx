import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Users, CalendarCheck, CalendarClock, Wallet } from "lucide-react";
import { routing } from "@/i18n/routing";
import { getDashboardStats } from "@/services/dashboard/stats.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const stats = await getDashboardStats();
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={String(stats.totalUsers)}
          Icon={Users}
        />
        <StatCard
          label="Upcoming Bookings"
          value={String(stats.upcomingBookings)}
          Icon={CalendarCheck}
        />
        <StatCard
          label="Today's Appointments"
          value={String(stats.todaysBookings)}
          Icon={CalendarClock}
        />
        <StatCard
          label="Pending Payments"
          value={String(stats.pendingPaymentsCount)}
          hint={currencyFormatter.format(stats.pendingPaymentsCents / 100)}
          Icon={Wallet}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-medium text-card-foreground">
            Recent Bookings
          </h2>
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
            {stats.recentBookings.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {stats.recentBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {booking.guestName}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {booking.consultationType.nameEn}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(booking.slot.startAt)}
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
  );
}
