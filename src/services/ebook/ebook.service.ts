import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EbookOrderStatus, PaymentProviderName } from "@/generated/prisma/enums";
import { PATIENT_FLOW_EBOOK } from "@/lib/ebook";
import type { EbookOrderInput } from "@/lib/validation/ebook.schema";
import { logger } from "@/lib/logger";

export const EBOOK_PRICE_CACHE_TAG = "cms:ebook-price";

export const getEbookPricing = nextCache(
  async () => {
    const settings = await prisma.ebookSettings.findUnique({
      where: { id: PATIENT_FLOW_EBOOK.slug },
    });
    return {
      priceCents: settings?.priceCents ?? PATIENT_FLOW_EBOOK.priceCents,
      currency: settings?.currency ?? PATIENT_FLOW_EBOOK.currency,
    };
  },
  ["cms-ebook-price"],
  { tags: [EBOOK_PRICE_CACHE_TAG], revalidate: 60 },
);

export async function updateEbookPriceEgp(priceEgp: number) {
  await prisma.ebookSettings.upsert({
    where: { id: PATIENT_FLOW_EBOOK.slug },
    update: { priceCents: Math.round(priceEgp * 100) },
    create: {
      id: PATIENT_FLOW_EBOOK.slug,
      priceCents: Math.round(priceEgp * 100),
    },
  });
}

export async function createEbookOrder(
  input: EbookOrderInput & { userId?: string },
) {
  const { priceCents, currency } = await getEbookPricing();
  return prisma.ebookOrder.create({
    data: {
      userId: input.userId,
      buyerName: input.name,
      buyerEmail: input.email,
      buyerPhone: input.phone,
      amountCents: priceCents,
      currency,
    },
  });
}

export async function getEbookOrder(id: string) {
  return prisma.ebookOrder.findUnique({ where: { id } });
}

/** Oldest first — the order staff should work through unpaid requests. */
export async function listEbookOrders() {
  return prisma.ebookOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

export async function markEbookOrderAsPaid(
  orderId: string,
  adminUserId: string,
) {
  await prisma.ebookOrder.updateMany({
    where: { id: orderId, status: EbookOrderStatus.PENDING },
    data: {
      status: EbookOrderStatus.PAID,
      paidAt: new Date(),
      manuallyMarkedByUserId: adminUserId,
    },
  });
}

/** Called from the Kashier webhook once a card payment succeeds — no
 * staff action required. Guarded on status=PENDING so a retried webhook
 * for an already-confirmed order is a safe no-op. */
export async function confirmEbookOrderFromGateway(input: {
  orderId: string;
  provider: PaymentProviderName;
  providerRefId: string;
  providerPayload: unknown;
  amountCents: number;
}): Promise<boolean> {
  const existing = await prisma.ebookOrder.findUnique({
    where: { id: input.orderId },
  });
  if (existing && existing.amountCents !== input.amountCents) {
    logger.error(
      {
        orderId: input.orderId,
        expectedAmountCents: existing.amountCents,
        webhookAmountCents: input.amountCents,
      },
      "Kashier webhook amount mismatch — refusing to confirm ebook order",
    );
    return false;
  }

  const result = await prisma.ebookOrder.updateMany({
    where: { id: input.orderId, status: EbookOrderStatus.PENDING },
    data: {
      status: EbookOrderStatus.PAID,
      paidAt: new Date(),
      provider: input.provider,
      providerRefId: input.providerRefId,
      providerPayload: input.providerPayload as never,
    },
  });
  return result.count > 0;
}

export async function listUserEbookOrders(userId: string) {
  return prisma.ebookOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/** Booking a paid consultation includes the Patient Flow ebook as a free
 * gift (per the marketing site) — called once that booking is confirmed
 * so the customer already owns it, no purchase needed. A no-op if they
 * already have a paid order (bought it separately, or already granted
 * one from an earlier booking). */
export async function grantFreeEbookForBooking({
  userId,
  name,
  email,
  phone,
}: {
  userId?: string;
  name: string;
  email: string;
  phone: string;
}): Promise<void> {
  if (userId) {
    const existing = await prisma.ebookOrder.findFirst({
      where: { userId, status: EbookOrderStatus.PAID },
    });
    if (existing) return;
  }

  await prisma.ebookOrder.create({
    data: {
      userId,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone,
      amountCents: 0,
      status: EbookOrderStatus.PAID,
      paidAt: new Date(),
    },
  });
}
