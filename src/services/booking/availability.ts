import { prisma } from "@/lib/prisma";
import { SlotStatus, BookingStatus, PaymentStatus } from "@/generated/prisma/enums";

export async function findNextOpenSlot(excludeIds: string[] = []) {
  return prisma.slot.findFirst({
    where: {
      status: SlotStatus.OPEN,
      startAt: { gt: new Date() },
      id: { notIn: excludeIds },
    },
    orderBy: { startAt: "asc" },
  });
}

/**
 * Reverts HELD slots whose hold has expired back to OPEN, and marks their
 * abandoned booking/payment as EXPIRED/FAILED. Called opportunistically
 * before every availability read rather than via a separate scheduled job.
 */
export async function sweepExpiredHolds() {
  const expired = await prisma.slot.findMany({
    where: { status: SlotStatus.HELD, holdExpiresAt: { lt: new Date() } },
    include: { booking: { include: { payment: true } } },
  });

  if (expired.length === 0) return;

  const slotIds = expired.map((slot) => slot.id);
  const bookingIds = expired.flatMap((slot) => (slot.booking ? [slot.booking.id] : []));
  const paymentIds = expired.flatMap((slot) =>
    slot.booking?.payment ? [slot.booking.payment.id] : [],
  );

  await prisma.$transaction([
    prisma.slot.updateMany({
      where: { id: { in: slotIds } },
      data: { status: SlotStatus.OPEN, holdExpiresAt: null },
    }),
    ...(bookingIds.length
      ? [
          prisma.booking.updateMany({
            where: { id: { in: bookingIds } },
            data: { status: BookingStatus.EXPIRED },
          }),
        ]
      : []),
    ...(paymentIds.length
      ? [
          prisma.payment.updateMany({
            where: { id: { in: paymentIds } },
            data: { status: PaymentStatus.FAILED },
          }),
        ]
      : []),
  ]);
}

/** Parses a "YYYY-MM-DD" string into local start/end-of-day boundaries. */
function dayBounds(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
}

export async function findOpenSlotsForDate(dateStr: string) {
  await sweepExpiredHolds();

  const { start, end } = dayBounds(dateStr);

  return prisma.slot.findMany({
    where: {
      status: SlotStatus.OPEN,
      startAt: { gte: start, lt: end, gt: new Date() },
    },
    orderBy: { startAt: "asc" },
  });
}

/**
 * Set of "YYYY-MM-DD" dates (local) with at least one open, bookable slot
 * within the next `days` days — used to gray out/disable days with no
 * availability on the public booking calendar.
 */
export async function findAvailableDates(days = 90) {
  await sweepExpiredHolds();

  const now = new Date();
  const horizonEnd = new Date(now);
  horizonEnd.setDate(horizonEnd.getDate() + days);

  const slots = await prisma.slot.findMany({
    where: {
      status: SlotStatus.OPEN,
      startAt: { gt: now, lt: horizonEnd },
    },
    select: { startAt: true },
  });

  const dates = new Set<string>();
  for (const slot of slots) {
    const d = slot.startAt;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.add(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/** Earliest date (YYYY-MM-DD, local) that currently has an open slot. */
export async function findEarliestAvailableDate() {
  await sweepExpiredHolds();

  const slot = await prisma.slot.findFirst({
    where: { status: SlotStatus.OPEN, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
  });

  if (!slot) return null;

  const d = slot.startAt;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
