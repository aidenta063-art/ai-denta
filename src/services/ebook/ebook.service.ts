import { prisma } from "@/lib/prisma";
import { EbookOrderStatus } from "@/generated/prisma/enums";
import { PATIENT_FLOW_EBOOK } from "@/lib/ebook";
import type { EbookOrderInput } from "@/lib/validation/ebook.schema";

export async function createEbookOrder(
  input: EbookOrderInput & { userId?: string },
) {
  return prisma.ebookOrder.create({
    data: {
      userId: input.userId,
      buyerName: input.name,
      buyerEmail: input.email,
      buyerPhone: input.phone,
      amountCents: PATIENT_FLOW_EBOOK.priceCents,
      currency: PATIENT_FLOW_EBOOK.currency,
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

export async function listUserEbookOrders(userId: string) {
  return prisma.ebookOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
