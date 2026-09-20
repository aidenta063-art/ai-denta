import { prisma } from "@/lib/prisma";
import { ConsultationKind, PaymentStatus } from "@/generated/prisma/enums";
import { dateKeyToUtcStart, shiftDateKey, cairoDateKey, daysBetweenInclusive } from "@/lib/date-range";

/** A report window as inclusive Cairo date keys ("YYYY-MM-DD"). */
export type ReportRange = { from: string; to: string };

export function lastNDaysRange(days: number): ReportRange {
  const to = cairoDateKey(new Date());
  return { from: shiftDateKey(to, -(days - 1)), to };
}

function rangeBounds({ from, to }: ReportRange) {
  return {
    gte: dateKeyToUtcStart(from),
    lt: dateKeyToUtcStart(shiftDateKey(to, 1)),
  };
}

export async function getReportsSummary(range: ReportRange) {
  const createdAt = rangeBounds(range);
  const sinceKey = range.from;
  const days = daysBetweenInclusive(range.from, range.to);

  const [bookings, payments, pageViews] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt },
      select: { createdAt: true, consultationType: { select: { kind: true } } },
    }),
    prisma.payment.findMany({
      where: {
        createdAt,
        status: { in: [PaymentStatus.PAID, PaymentStatus.MANUALLY_MARKED_PAID] },
      },
      select: { createdAt: true, amountCents: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt },
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

export async function getRecentBookingsForReport(range: ReportRange, take = 15) {
  return prisma.booking.findMany({
    where: { createdAt: rangeBounds(range) },
    orderBy: { createdAt: "desc" },
    take,
    include: { consultationType: true, slot: true },
  });
}
