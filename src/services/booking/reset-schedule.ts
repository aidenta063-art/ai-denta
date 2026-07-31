import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/services/booking/slot-generation";

// One-off: replace the booking schedule with 4 fixed evening slots a day
// (every day except Friday), wiping all existing bookings/slots/rules.
const WORKING_WEEKDAYS = [0, 1, 2, 3, 4, 6]; // Sun-Thu + Sat; Friday (5) is off
const TIME_RANGES: [string, string][] = [
  ["14:00", "14:30"],
  ["15:00", "15:30"],
  ["21:00", "21:30"],
  ["22:00", "22:30"],
];
const SLOT_LENGTH_MINUTES = 30;
const HORIZON_DAYS = 14;

export async function resetBookingSchedule() {
  const { count: paymentsDeleted } = await prisma.payment.deleteMany({});
  const { count: bookingsDeleted } = await prisma.booking.deleteMany({});
  const { count: slotsDeleted } = await prisma.slot.deleteMany({});
  const { count: rulesDeleted } = await prisma.workingHoursRule.deleteMany({});

  const rulesData = WORKING_WEEKDAYS.flatMap((weekday) =>
    TIME_RANGES.map(([startTime, endTime]) => ({
      weekday,
      startTime,
      endTime,
      slotLengthMinutes: SLOT_LENGTH_MINUTES,
    })),
  );
  await prisma.workingHoursRule.createMany({ data: rulesData });

  const { created: slotsCreated } = await generateSlots({
    horizonDays: HORIZON_DAYS,
  });

  return {
    paymentsDeleted,
    bookingsDeleted,
    slotsDeleted,
    rulesDeleted,
    rulesCreated: rulesData.length,
    slotsCreated,
  };
}
