import { prisma } from "@/lib/prisma";
import { SlotStatus, BookingStatus, ConsultationKind } from "@/generated/prisma/enums";
import { sweepExpiredHolds, earliestBookableTime } from "@/services/booking/availability";
import { createPendingPayment } from "@/services/payments/payment.service";
import {
  sendWhatsAppTemplateSafe,
  formatWhatsAppDate,
  formatWhatsAppTime,
} from "@/lib/whatsapp";
import { computeFinalPriceCents } from "@/lib/pricing";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import type { IntakeInput } from "@/lib/validation/intake.schema";

const HOLD_DURATION_MINUTES = 10;
const ADMIN_NOTIFICATION_EMAIL = "Support@ai-denta.com";

async function notifyAdminOfBooking({
  name,
  consultationLabel,
  when,
}: {
  name: string;
  consultationLabel: string;
  when: Date;
}) {
  try {
    await sendEmail({
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `New booking: ${name} (${consultationLabel})`,
      text: `${name} just booked a ${consultationLabel.toLowerCase()}.\n\nTime: ${formatWhatsAppDate(when, "en")}, ${formatWhatsAppTime(when, "en")}`,
    });
  } catch (error) {
    logger.error({ err: error, name }, "Failed to send admin booking notification email");
  }
}

export type CreateFreeBookingResult =
  | { bookingId: string }
  | { error: "alreadyUsedFree" };

export type CreatePaidBookingHoldResult =
  | { bookingId: string }
  | { error: "slotNoLongerAvailable" };

/** One free consultation per account, ever. */
export async function hasUsedFreeConsultation(userId: string): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: { userId, consultationType: { kind: ConsultationKind.FREE } },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Free consultations are a waitlist, not a scheduled slot: no Slot is
 * claimed, so they never compete with the paid calendar's limited daily
 * slots. Staff work through requests in order (see listFreeBookingRequests)
 * and contact people directly.
 */
export async function createFreeBooking(
  input: IntakeInput & { userId?: string },
): Promise<CreateFreeBookingResult> {
  if (input.userId && (await hasUsedFreeConsultation(input.userId))) {
    return { error: "alreadyUsedFree" };
  }

  const freeType = await prisma.consultationType.findUnique({
    where: { kind: ConsultationKind.FREE },
  });
  if (!freeType) {
    throw new Error("FREE consultation type is not seeded");
  }

  const { name, email, phone, userId, ...intakeAnswers } = input;

  const booking = await prisma.booking.create({
    data: {
      consultationTypeId: freeType.id,
      status: BookingStatus.CONFIRMED,
      userId,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      intakeAnswers,
    },
  });

  const templateName = process.env.WHATSAPP_TEMPLATE_FREE_BOOKING_RECEIVED;
  if (templateName && phone && name) {
    const sent = await sendWhatsAppTemplateSafe({
      to: phone,
      templateName,
      bodyParams: [name],
    });
    if (sent) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { confirmationSentAt: new Date() },
      });
    }
  }

  if (name) {
    await notifyAdminOfBooking({
      name,
      consultationLabel: "Free Consultation",
      when: booking.createdAt,
    });
  }

  return { bookingId: booking.id };
}

/**
 * Reserves a user-picked slot for a paid consultation: conditionally
 * flips it OPEN -> HELD (10-minute hold), creates the booking as
 * PENDING_PAYMENT, and creates a PENDING payment via the manual
 * provider — all inside one transaction, so a 0-row update (slot taken
 * between page load and click) rolls back cleanly.
 */
export async function createPaidBookingHold(
  input: IntakeInput & { slotId: string; userId?: string },
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

  const { name, email, phone, slotId, userId, ...intakeAnswers } = input;

  const booking = await prisma.$transaction(async (tx) => {
    const claimed = await tx.slot.updateMany({
      where: {
        id: slotId,
        status: SlotStatus.OPEN,
        startAt: { gt: earliestBookableTime() },
      },
      data: { status: SlotStatus.HELD, holdExpiresAt },
    });
    if (claimed.count === 0) return null;

    const created = await tx.booking.create({
      data: {
        slotId,
        consultationTypeId: paidType.id,
        status: BookingStatus.PENDING_PAYMENT,
        userId,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        intakeAnswers,
      },
    });

    await createPendingPayment(tx, {
      bookingId: created.id,
      amountCents: computeFinalPriceCents({
        priceCents: paidType.priceCents ?? 0,
        discountEnabled: paidType.discountEnabled,
        discountType: paidType.discountType,
        discountValue: paidType.discountValue,
      }),
      currency: paidType.currency,
    });

    return created;
  });

  if (!booking) {
    return { error: "slotNoLongerAvailable" };
  }

  if (name) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      select: { startAt: true },
    });
    if (slot) {
      await notifyAdminOfBooking({
        name,
        consultationLabel: "Paid Consultation",
        when: slot.startAt,
      });
    }
  }

  return { bookingId: booking.id };
}
