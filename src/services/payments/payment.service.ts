import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { PaymentProviderName, PaymentStatus } from "@/generated/prisma/enums";
import { ManualProvider } from "@/services/payments/providers/manual.provider";

type Db = typeof prisma | Prisma.TransactionClient;

const manualProvider = new ManualProvider();

export async function createPendingPayment(
  db: Db,
  input: { bookingId: string; amountCents: number; currency?: string },
) {
  const session = await manualProvider.createSession({
    bookingId: input.bookingId,
    amountCents: input.amountCents,
    currency: input.currency ?? "EGP",
  });

  return db.payment.create({
    data: {
      bookingId: input.bookingId,
      amountCents: input.amountCents,
      currency: input.currency ?? "EGP",
      status: PaymentStatus.PENDING,
      provider: PaymentProviderName.MANUAL,
      providerRefId: session.providerRefId,
    },
  });
}
