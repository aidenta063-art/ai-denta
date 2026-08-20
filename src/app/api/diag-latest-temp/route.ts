import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route. Delete after use.
export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { payment: true },
  });

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      status: b.status,
      createdAt: b.createdAt,
      payment: b.payment && {
        status: b.payment.status,
        provider: b.payment.provider,
        providerRefId: b.payment.providerRefId,
        createdAt: b.payment.createdAt,
        updatedAt: b.payment.updatedAt,
      },
    })),
  );
}
