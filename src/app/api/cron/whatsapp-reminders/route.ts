import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/enums";
import {
  sendWhatsAppTemplateSafe,
  formatWhatsAppDate,
  formatWhatsAppTime,
} from "@/lib/whatsapp";

const HOUR_MS = 60 * 60 * 1000;
const REMINDER_24H_TARGET_MS = 24 * HOUR_MS;
const REMINDER_1H_TARGET_MS = HOUR_MS;
// Half-window on each side of the target offset — must cover the gap
// between cron runs (~15 min) so a booking is never skipped or double-hit.
const WINDOW_MS = 15 * 60 * 1000;

async function sendDueReminders({
  targetOffsetMs,
  sentAtField,
  templateName,
}: {
  targetOffsetMs: number;
  sentAtField: "reminder24hSentAt" | "reminder1hSentAt";
  templateName: string;
}) {
  const now = Date.now();
  const windowStart = new Date(now + targetOffsetMs - WINDOW_MS);
  const windowEnd = new Date(now + targetOffsetMs + WINDOW_MS);

  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      [sentAtField]: null,
      slot: { startAt: { gte: windowStart, lte: windowEnd } },
    },
    include: { slot: true, user: true },
  });

  let sentCount = 0;
  for (const booking of bookings) {
    const phone = booking.user?.phone ?? booking.guestPhone;
    if (!phone || !booking.slot) continue;

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
        where: { id: booking.id },
        data: { [sentAtField]: new Date() },
      });
      sentCount += 1;
    }
  }

  return sentCount;
}

/** Hit externally on a short interval (e.g. every 15 min via cron-job.org —
 * Vercel Hobby's cron only runs daily, too coarse for a 1-hour-before
 * reminder) with the same Bearer auth as /api/cron/generate-slots. */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template24h = process.env.WHATSAPP_TEMPLATE_REMINDER_24H;
  const template1h = process.env.WHATSAPP_TEMPLATE_REMINDER_1H;

  const [reminder24hSent, reminder1hSent] = await Promise.all([
    template24h
      ? sendDueReminders({
          targetOffsetMs: REMINDER_24H_TARGET_MS,
          sentAtField: "reminder24hSentAt",
          templateName: template24h,
        })
      : Promise.resolve(0),
    template1h
      ? sendDueReminders({
          targetOffsetMs: REMINDER_1H_TARGET_MS,
          sentAtField: "reminder1hSentAt",
          templateName: template1h,
        })
      : Promise.resolve(0),
  ]);

  return NextResponse.json({ reminder24hSent, reminder1hSent });
}
