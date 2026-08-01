import { prisma } from "@/lib/prisma";
import { ConsultationKind, PaymentStatus } from "@/generated/prisma/enums";
import { APP_TIME_ZONE, zonedTimeToUtc } from "@/lib/timezone";

// Vercel's runtime is pinned to UTC, so "today" via server-local Date
// methods silently drifts from Cairo's actual calendar day — same class
// of bug fixed in slot-generation.ts. Bucket everything by Cairo date.
function cairoDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function shiftDateKey(key: string, offsetDays: number): string {
  const [year, month, day] = key.split("-").map(Number);
  // Noon UTC keeps this comfortably clear of any DST-transition edge case.
  const base = new Date(Date.UTC(year, month - 1, day, 12));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

function dateKeyToUtcStart(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return zonedTimeToUtc(year, month - 1, day, 0, 0);
}

function reportWindowStart(days: number): Date {
  const todayKey = cairoDateKey(new Date());
  const sinceKey = shiftDateKey(todayKey, -(days - 1));
  return dateKeyToUtcStart(sinceKey);
}

export async function getReportsSummary(days = 30) {
  const since = reportWindowStart(days);
  const todayKey = cairoDateKey(new Date());
  const sinceKey = shiftDateKey(todayKey, -(days - 1));

  const [bookings, payments, pageViews] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, consultationType: { select: { kind: true } } },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: [PaymentStatus.PAID, PaymentStatus.MANUALLY_MARKED_PAID] },
      },
      select: { createdAt: true, amountCents: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, visitorId: true, path: true },
    }),
  ]);

  const dayKeys = Array.from({ length: days }, (_, i) => shiftDateKey(sinceKey, i));

  const byDay = new Map(
    dayKeys.map((date) => [
      date,
      {
        date,
        freeBookings: 0,
        paidBookings: 0,
        revenueCents: 0,
        pageViews: 0,
        visitors: new Set<string>(),
      },
    ]),
  );

  for (const booking of bookings) {
    const entry = byDay.get(cairoDateKey(booking.createdAt));
    if (!entry) continue;
    if (booking.consultationType.kind === ConsultationKind.FREE) entry.freeBookings++;
    else entry.paidBookings++;
  }

  for (const payment of payments) {
    const entry = byDay.get(cairoDateKey(payment.createdAt));
    if (entry) entry.revenueCents += payment.amountCents;
  }

  const pathCounts = new Map<string, number>();
  for (const view of pageViews) {
    const entry = byDay.get(cairoDateKey(view.createdAt));
    if (entry) {
      entry.pageViews++;
      entry.visitors.add(view.visitorId);
    }
    pathCounts.set(view.path, (pathCounts.get(view.path) ?? 0) + 1);
  }

  const series = dayKeys.map((date) => {
    const entry = byDay.get(date)!;
    return {
      date,
      freeBookings: entry.freeBookings,
      paidBookings: entry.paidBookings,
      revenueCents: entry.revenueCents,
      pageViews: entry.pageViews,
      visitors: entry.visitors.size,
    };
  });

  const topPages = [...pathCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([path, views]) => ({ path, views }));

  return {
    series,
    topPages,
    totals: {
      pageViews: pageViews.length,
      uniqueVisitors: new Set(pageViews.map((v) => v.visitorId)).size,
      bookings: bookings.length,
      revenueCents: payments.reduce((sum, p) => sum + p.amountCents, 0),
    },
  };
}

export async function getRecentBookingsForReport(days = 30, take = 15) {
  const since = reportWindowStart(days);

  return prisma.booking.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take,
    include: { consultationType: true, slot: true },
  });
}
