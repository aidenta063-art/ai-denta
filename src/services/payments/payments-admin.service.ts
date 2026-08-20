import { prisma } from "@/lib/prisma";
import {
  PaymentStatus,
  BookingStatus,
  SlotStatus,
  PaymentProviderName,
} from "@/generated/prisma/enums";
import {
  sendWhatsAppTemplateSafe,
  formatWhatsAppDate,
  formatWhatsAppTime,
} from "@/lib/whatsapp";
import { logger } from "@/lib/logger";
import { grantFreeEbookForBooking } from "@/services/ebook/ebook.service";

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
 * Shared core for confirming a booking's payment, however it was
 * confirmed (staff clicking "Mark as Paid", or a gateway webhook). Uses
 * an updateMany guarded on status=PENDING so it's safe to call more than
 * once for the same payment — gateways like Kashier retry webhooks, and
 * this must not double-cascade the booking or send a second WhatsApp
 * message. Cascades the booking to CONFIRMED and the slot to BOOKED (in
 * case it was still HELD).
 */
async function confirmBookingPayment(input: {
  paymentId: string;
  status: typeof PaymentStatus.PAID | typeof PaymentStatus.MANUALLY_MARKED_PAID;
  manuallyMarkedByUserId?: string;
  provider?: PaymentProviderName;
  providerRefId?: string;
  providerPayload?: unknown;
  /** When set (gateway confirmations only), the payment must still be
   * PENDING for this amount — refuses to confirm a webhook whose amount
   * doesn't match what we charged for. */
  expectedAmountCents?: number;
}) {
  const confirmed = await prisma.$transaction(async (tx) => {
    if (input.expectedAmountCents !== undefined) {
      const existing = await tx.payment.findUnique({
        where: { id: input.paymentId },
      });
      if (existing && existing.amountCents !== input.expectedAmountCents) {
        logger.error(
          {
            paymentId: input.paymentId,
            expectedAmountCents: existing.amountCents,
            webhookAmountCents: input.expectedAmountCents,
          },
          "Kashier webhook amount mismatch — refusing to confirm payment",
        );
        return null;
      }
    }

    const updated = await tx.payment.updateMany({
      // Also recoverable from FAILED: if our own hold-expiry sweep marked
      // a payment FAILED before Kashier's webhook (or an admin) could
      // confirm it actually succeeded, this still lets it be confirmed
      // rather than leaving a genuinely-paid customer stuck unconfirmed.
      where: {
        id: input.paymentId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
      },
      data: {
        status: input.status,
        paidAt: new Date(),
        ...(input.manuallyMarkedByUserId && {
          manuallyMarkedByUserId: input.manuallyMarkedByUserId,
        }),
        ...(input.provider && { provider: input.provider }),
        ...(input.providerRefId && { providerRefId: input.providerRefId }),
        ...(input.providerPayload !== undefined && {
          providerPayload: input.providerPayload as never,
        }),
      },
    });
    if (updated.count === 0) return null;

    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: input.paymentId },
      include: { booking: { include: { slot: true, user: true } } },
    });
    // Payments only ever exist for paid (slotted) bookings — free
    // consultations never create one, so this should be impossible
    // outside data corruption.
    if (!payment.booking.slotId) {
      throw new Error(`Payment ${input.paymentId} has no slotted booking`);
    }

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });
    await tx.slot.update({
      where: { id: payment.booking.slotId },
      data: { status: SlotStatus.BOOKED, holdExpiresAt: null },
    });

    return {
      bookingId: payment.bookingId,
      userId: payment.booking.userId ?? undefined,
      name: payment.booking.user?.name ?? payment.booking.guestName ?? "Guest",
      email: payment.booking.user?.email ?? payment.booking.guestEmail ?? "",
      phone: payment.booking.user?.phone ?? payment.booking.guestPhone ?? "",
    };
  });

  if (confirmed) {
    await sendBookingConfirmedWhatsApp(confirmed.bookingId);
    // Booking a paid consultation includes the Patient Flow ebook as a
    // free gift (per the marketing site) — grant it automatically
    // instead of making the customer buy it separately.
    await grantFreeEbookForBooking({
      userId: confirmed.userId,
      name: confirmed.name,
      email: confirmed.email,
      phone: confirmed.phone,
    });
  }
}

/**
 * Interim manual confirmation path — staff confirm payment out-of-band
 * (bank transfer, etc.) and flip the status here.
 */
export async function markPaymentAsPaid(paymentId: string, adminUserId: string) {
  await confirmBookingPayment({
    paymentId,
    status: PaymentStatus.MANUALLY_MARKED_PAID,
    manuallyMarkedByUserId: adminUserId,
  });
}

/** Called from the Kashier webhook once a card payment succeeds — no
 * staff action required. */
export async function confirmBookingPaymentFromGateway(input: {
  paymentId: string;
  provider: PaymentProviderName;
  providerRefId: string;
  providerPayload: unknown;
  amountCents: number;
}) {
  await confirmBookingPayment({
    paymentId: input.paymentId,
    status: PaymentStatus.PAID,
    provider: input.provider,
    providerRefId: input.providerRefId,
    providerPayload: input.providerPayload,
    expectedAmountCents: input.amountCents,
  });
}

/** Called from the Kashier webhook when a card payment fails — leaves the
 * booking/slot untouched (still held) so the customer can retry, but marks
 * the payment so staff can see the failed attempt instead of it looking
 * like it's still awaiting one. Guarded on status=PENDING like the success
 * path, so it's safe if the webhook retries. */
export async function markBookingPaymentFailedFromGateway(paymentId: string) {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED },
  });
}

async function sendBookingConfirmedWhatsApp(bookingId: string) {
  const templateName = process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMED;
  if (!templateName) return;

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { slot: true, user: true },
  });
  const phone = booking.user?.phone ?? booking.guestPhone;
  if (!phone || !booking.slot) return;

  const sent = await sendWhatsAppTemplateSafe({
    to: phone,
    templateName,
    bodyParams: [
      formatWhatsAppDate(booking.slot.startAt),
      formatWhatsAppTime(booking.slot.startAt),
    ],
  });

  if (sent) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { confirmationSentAt: new Date() },
    });
  }
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
    p.booking.slot?.startAt.toISOString() ?? "",
    p.createdAt.toISOString(),
  ]);

  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;

  return [header, ...rows]
    .map((row) => row.map((cell) => escape(String(cell))).join(","))
    .join("\n");
}
