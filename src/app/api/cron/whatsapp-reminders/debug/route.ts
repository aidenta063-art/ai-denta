import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Temporary read-only diagnostic for the WhatsApp reminder cron — same
 * auth as the cron route itself. Not linked from anywhere in the app;
 * remove once the missed-reminder investigation is done. */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { slot: true },
  });

  const now = new Date();
  const data = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    createdAt: b.createdAt,
    slotStartAt: b.slot?.startAt ?? null,
    minutesUntilSlot: b.slot?.startAt
      ? Math.round((b.slot.startAt.getTime() - now.getTime()) / 60000)
      : null,
    confirmationSentAt: b.confirmationSentAt,
    reminder24hSentAt: b.reminder24hSentAt,
    reminder1hSentAt: b.reminder1hSentAt,
  }));

  return NextResponse.json({ now, data });
}
