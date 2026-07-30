import { prisma } from "@/lib/prisma";
import { SlotStatus, BookingStatus, ConsultationKind } from "@/generated/prisma/enums";
import { findNextOpenSlot, sweepExpiredHolds } from "@/services/booking/availability";
import { createPendingPayment } from "@/services/payments/payment.service";
import type { FreeBookingInput } from "@/lib/validation/booking.schema";

const MAX_BOOKING_ATTEMPTS = 5;
const HOLD_DURATION_MINUTES = 10;

export type CreateFreeBookingResult =
  | { bookingId: string }
  | { error: "noSlotsAvailable" };

export type CreatePaidBookingHoldResult =
  | { bookingId: string }
  | { error: "slotNoLongerAvailable" };

/**
 * Auto-assigns the earliest open slot to a free-consultation booking.
 * Each candidate slot is claimed via a conditional update (status must
 * still be OPEN) inside a transaction; a 0-row update means another
 * request won the race, so we retry against the next candidate. The
 * unique constraint on Booking.slotId is the final backstop.
 */
export async function createFreeBooking(
  input: FreeBookingInput & { userId?: string },
): Promise<CreateFreeBookingResult> {
  const freeType = await prisma.consultationType.findUnique({
    where: { kind: ConsultationKind.FREE },
  });
  if (!freeType) {
    throw new Error("FREE consultation type is not seeded");
  }

  const excludeIds: string[] = [];

  for (let attempt = 0; attempt < MAX_BOOKING_ATTEMPTS; attempt++) {
    const candidate = await findNextOpenSlot(excludeIds);
    if (!candidate) {
      return { error: "noSlotsAvailable" };
    }

    const booking = await prisma.$transaction(async (tx) => {
      const claimed = await tx.slot.updateMany({
        where: { id: candidate.id, status: SlotStatus.OPEN },
        data: { status: SlotStatus.BOOKED },
      });
      if (claimed.count === 0) return null;

      return tx.booking.create({
        data: {
          slotId: candidate.id,
          consultationTypeId: freeType.id,
          status: BookingStatus.CONFIRMED,
          userId: input.userId,
          guestName: input.name,
          guestEmail: input.email,
          guestPhone: input.phone,
        },
      });
    });

    if (booking) {
      return { bookingId: booking.id };
    }

    excludeIds.push(candidate.id);
  }

  return { error: "noSlotsAvailable" };
}

/**
 * Reserves a user-picked slot for a paid consultation: conditionally
 * flips it OPEN -> HELD (10-minute hold), creates the booking as
 * PENDING_PAYMENT, and creates a PENDING payment via the manual
 * provider — all inside one transaction, so a 0-row update (slot taken
 * between page load and click) rolls back cleanly.
 */
export async function createPaidBookingHold(
  input: FreeBookingInput & { slotId: string; userId?: string },
): Promise<CreatePaidBookingHoldResult> {
  await sweepExpiredHolds();

  const paidType = await prisma.consultationType.findUnique({
    where: { kind: ConsultationKind.PAID },
  });
  if (!paidType) {
    throw new Error("PAID consultation type is not seeded");
  }

  const holdExpiresAt = new Date(
    Date.now() + HOLD_DURATION_MINUTES * 60_000,
  );

  const booking = await prisma.$transaction(async (tx) => {
    const claimed = await tx.slot.updateMany({
      where: { id: input.slotId, status: SlotStatus.OPEN },
      data: { status: SlotStatus.HELD, holdExpiresAt },
    });
    if (claimed.count === 0) return null;

    const created = await tx.booking.create({
      data: {
        slotId: input.slotId,
        consultationTypeId: paidType.id,
        status: BookingStatus.PENDING_PAYMENT,
        userId: input.userId,
        guestName: input.name,
        guestEmail: input.email,
        guestPhone: input.phone,
      },
    });

    await createPendingPayment(tx, {
      bookingId: created.id,
      amountCents: paidType.priceCents ?? 0,
      currency: paidType.currency,
    });

    return created;
  });

  if (!booking) {
    return { error: "slotNoLongerAvailable" };
  }

  return { bookingId: booking.id };
}
