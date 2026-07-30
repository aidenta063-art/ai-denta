import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/generated/prisma/enums";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    totalUsers,
    upcomingBookings,
    todaysBookings,
    pendingPayments,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count({
      where: {
        status: BookingStatus.CONFIRMED,
        slot: { startAt: { gt: now } },
      },
    }),
    prisma.booking.count({
      where: {
        status: BookingStatus.CONFIRMED,
        slot: { startAt: { gte: todayStart, lt: todayEnd } },
      },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PENDING },
      _count: true,
      _sum: { amountCents: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { slot: true, consultationType: true },
    }),
  ]);

  return {
    totalUsers,
    upcomingBookings,
    todaysBookings,
    pendingPaymentsCount: pendingPayments._count,
    pendingPaymentsCents: pendingPayments._sum.amountCents ?? 0,
    recentBookings,
  };
}
