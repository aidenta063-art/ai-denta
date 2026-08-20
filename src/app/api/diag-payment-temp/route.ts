import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route — shows the raw provider payload for recent
// payments so we can see exactly what Kashier's webhook reported. Delete
// after use.
export async function GET() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      booking: { include: { user: true } },
    },
  });

  return NextResponse.json(
    payments.map((p) => ({
      id: p.id,
      status: p.status,
      amountCents: p.amountCents,
      currency: p.currency,
      provider: p.provider,
      providerRefId: p.providerRefId,
      providerPayload: p.providerPayload,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      customerEmail: p.booking.user?.email ?? p.booking.guestEmail,
    })),
  );
}
