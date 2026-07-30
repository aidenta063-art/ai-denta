import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus, SlotStatus } from "@/generated/prisma/enums";

export async function listPayments({ status }: { status?: PaymentStatus } = {}) {
  return prisma.payment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        include: { slot: true, consultationType: true, user: true },
      },
    },
  });
}

/**
 * Interim manual confirmation path while no real payment gateway is wired
 * in — staff confirm payment out-of-band (bank transfer, etc.) and flip
 * the status here. Cascades the booking to CONFIRMED and the slot to
 * BOOKED (in case it was still HELD).
 */
export async function markPaymentAsPaid(paymentId: string, adminUserId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { booking: true },
  });

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.MANUALLY_MARKED_PAID,
        paidAt: new Date(),
        manuallyMarkedByUserId: adminUserId,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    }),
    prisma.slot.update({
      where: { id: payment.booking.slotId },
      data: { status: SlotStatus.BOOKED, holdExpiresAt: null },
    }),
  ]);
}

export async function paymentsToCsv() {
  const payments = await listPayments();

  const header = [
    "id",
    "status",
    "provider",
    "amount",
    "currency",
    "consultation",
    "customer",
    "email",
    "slotStartAt",
    "createdAt",
  ];

  const rows = payments.map((p) => [
    p.id,
    p.status,
    p.provider,
    (p.amountCents / 100).toFixed(2),
    p.currency,
    p.booking.consultationType.nameEn,
    p.booking.user?.name ?? p.booking.guestName ?? "",
    p.booking.user?.email ?? p.booking.guestEmail ?? "",
    p.booking.slot.startAt.toISOString(),
    p.createdAt.toISOString(),
  ]);

  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;

  return [header, ...rows]
    .map((row) => row.map((cell) => escape(String(cell))).join(","))
    .join("\n");
}
