import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/enums";
import {
  sendWhatsAppTemplateSafe,
  formatWhatsAppDate,
  formatWhatsAppTime,
} from "@/lib/whatsapp";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

// Catch windows are one-sided ranges, not a narrow band around the exact
// target offset — a booking confirmed close to the edge of a target (e.g.
// 62 minutes before its slot, just past the old "more than an hour" bar)
// could end up with less than one cron interval of matching time in a
// tight ±15min band and get skipped entirely depending on tick alignment.
// A booking becomes eligible the moment it enters its range and stays
// eligible (still unsent) until the range's lower bound, so any cron
// cadence faster than the range width is guaranteed to catch it.
const REMINDER_24H_RANGE_MS = { min: 75 * MINUTE_MS, max: 24 * HOUR_MS };
const REMINDER_1H_RANGE_MS = { min: 5 * MINUTE_MS, max: 75 * MINUTE_MS };

async function sendDueReminders({
  range,
  sentAtField,
  templateName,
  buildBodyParams,
}: {
  range: { min: number; max: number };
  sentAtField: "reminder24hSentAt" | "reminder1hSentAt";
  templateName: string;
  buildBodyParams: (slotStartAt: Date) => string[];
}) {
  const now = Date.now();
  const windowStart = new Date(now + range.min);
  const windowEnd = new Date(now + range.max);

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
      bodyParams: buildBodyParams(booking.slot.startAt),
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
          range: REMINDER_24H_RANGE_MS,
          sentAtField: "reminder24hSentAt",
          templateName: template24h,
          // Template has 2 vars: {{1}} date, {{2}} time.
          buildBodyParams: (slotStartAt) => [
            formatWhatsAppDate(slotStartAt),
            formatWhatsAppTime(slotStartAt),
          ],
        })
      : Promise.resolve(0),
    template1h
      ? sendDueReminders({
          range: REMINDER_1H_RANGE_MS,
          sentAtField: "reminder1hSentAt",
          templateName: template1h,
          // Template has 1 var: {{1}} time only.
          buildBodyParams: (slotStartAt) => [formatWhatsAppTime(slotStartAt)],
        })
      : Promise.resolve(0),
  ]);

  return NextResponse.json({ reminder24hSent, reminder1hSent });
}
