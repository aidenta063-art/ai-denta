import { prisma } from "@/lib/prisma";
import { SlotStatus, ConsultationKind, BookingStatus } from "@/generated/prisma/enums";
import { generateSlots } from "@/services/booking/slot-generation";
import type {
  WorkingHoursRuleInput,
  HolidayInput,
} from "@/lib/validation/appointments.schema";

function dayBounds(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
}

/** One row per weekday (0=Sunday..6=Saturday), null where no hours are set. */
export async function listWeeklySchedule() {
  const rules = await prisma.workingHoursRule.findMany();
  const byWeekday = new Map(rules.map((r) => [r.weekday, r]));
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    rule: byWeekday.get(weekday) ?? null,
  }));
}

/**
 * Sets (or clears, when `hours` is null) a single weekday's working hours.
 * Enforces "one rule per weekday" so the admin always sees one clear row
 * per day rather than a free-form rule list. Any future, still-open
 * (never booked) slots on that weekday are cleared first so stale times
 * from the previous hours never linger alongside the new ones.
 */
export async function saveWorkingHoursForWeekday(
  weekday: number,
  hours: Omit<WorkingHoursRuleInput, "weekday"> | null,
) {
  await prisma.workingHoursRule.deleteMany({ where: { weekday } });

  const now = new Date();
  const horizonEnd = new Date(now);
  horizonEnd.setDate(horizonEnd.getDate() + 90);

  const candidates = await prisma.slot.findMany({
    where: {
      status: SlotStatus.OPEN,
      startAt: { gt: now, lt: horizonEnd },
    },
    select: { id: true, startAt: true },
  });
  const staleIds = candidates
    .filter((slot) => slot.startAt.getDay() === weekday)
    .map((slot) => slot.id);
  if (staleIds.length > 0) {
    await prisma.slot.deleteMany({ where: { id: { in: staleIds } } });
  }

  if (hours) {
    await prisma.workingHoursRule.create({ data: { weekday, ...hours } });
    await generateSlots();
  }
}

export async function listHolidays() {
  return prisma.holiday.findMany({ orderBy: { date: "asc" } });
}

/**
 * Adding a holiday immediately blocks that day's currently-open slots so
 * they disappear from the public picker right away, without touching
 * slots that are already booked.
 */
export async function addHoliday(input: HolidayInput) {
  const [year, month, day] = input.date.split("-").map(Number);
  // @db.Date has no timezone of its own; construct at UTC midnight so the
  // calendar date round-trips correctly regardless of server timezone.
  const date = new Date(Date.UTC(year, month - 1, day));

  const holiday = await prisma.holiday.create({
    data: { date, reason: input.reason || null },
  });

  const { start, end } = dayBounds(input.date);
  await prisma.slot.updateMany({
    where: { status: SlotStatus.OPEN, startAt: { gte: start, lt: end } },
    data: { status: SlotStatus.BLOCKED },
  });

  return holiday;
}

/** Removing a holiday reopens that day's blocked slots and backfills any missing ones. */
export async function deleteHoliday(id: string) {
  const holiday = await prisma.holiday.findUniqueOrThrow({ where: { id } });
  const dateStr = holiday.date.toISOString().slice(0, 10);
  const { start, end } = dayBounds(dateStr);

  await prisma.holiday.delete({ where: { id } });

  await prisma.slot.updateMany({
    where: { status: SlotStatus.BLOCKED, startAt: { gte: start, lt: end } },
    data: { status: SlotStatus.OPEN },
  });

  await generateSlots();
}

/** Convenience for the calendar day panel, which only has the date on hand. */
export async function deleteHolidayByDate(dateStr: string) {
  const { start, end } = dayBounds(dateStr);
  const holiday = await prisma.holiday.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  if (holiday) {
    await deleteHoliday(holiday.id);
  }
}

export async function listSlotsForDate(dateStr: string) {
  const { start, end } = dayBounds(dateStr);
  const slots = await prisma.slot.findMany({
    where: { startAt: { gte: start, lt: end } },
    orderBy: { startAt: "asc" },
    // A slot can carry past (expired/cancelled) bookings alongside its
    // current one — only the active claim matters for display here.
    include: {
      bookings: {
        where: {
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        },
      },
    },
  });
  return slots.map(({ bookings, ...slot }) => ({
    ...slot,
    booking: bookings[0] ?? null,
  }));
}

/** Per-day open/booked/blocked counts for the next `days` days, for the overview list. */
export async function listUpcomingSlotSummary(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizonEnd = new Date(today);
  horizonEnd.setDate(horizonEnd.getDate() + days);

  const slots = await prisma.slot.findMany({
    where: { startAt: { gte: today, lt: horizonEnd } },
    select: { startAt: true, status: true },
  });

  const byDate = new Map<
    string,
    { open: number; booked: number; blocked: number }
  >();

  for (const slot of slots) {
    const key = slot.startAt.toISOString().slice(0, 10);
    const entry = byDate.get(key) ?? { open: 0, booked: 0, blocked: 0 };
    if (slot.status === SlotStatus.OPEN) entry.open++;
    else if (slot.status === SlotStatus.BOOKED || slot.status === SlotStatus.HELD)
      entry.booked++;
    else if (slot.status === SlotStatus.BLOCKED) entry.blocked++;
    byDate.set(key, entry);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}

export async function blockSlot(id: string) {
  await prisma.slot.updateMany({
    where: { id, status: SlotStatus.OPEN },
    data: { status: SlotStatus.BLOCKED },
  });
}

export async function unblockSlot(id: string) {
  await prisma.slot.updateMany({
    where: { id, status: SlotStatus.BLOCKED },
    data: { status: SlotStatus.OPEN },
  });
}

/** Only ever allowed for slots with no booking attached. */
export async function deleteSlot(id: string) {
  await prisma.slot.deleteMany({
    where: {
      id,
      status: { in: [SlotStatus.OPEN, SlotStatus.BLOCKED] },
    },
  });
}

/**
 * Creates one custom slot directly at an arbitrary date/time, independent
 * of the recurring weekly hours — this is how an admin adds a one-off
 * slot to a specific day from the calendar. Rejects overlap with any
 * existing slot that day (open, held, booked, or blocked) so two slots
 * can never cover the same time range.
 */
export async function addCustomSlot(input: {
  date: string;
  startTime: string;
  endTime: string;
}) {
  const [year, month, day] = input.date.split("-").map(Number);
  const [startHour, startMinute] = input.startTime.split(":").map(Number);
  const [endHour, endMinute] = input.endTime.split(":").map(Number);

  const startAt = new Date(year, month - 1, day, startHour, startMinute);
  const endAt = new Date(year, month - 1, day, endHour, endMinute);

  if (endAt <= startAt) {
    return { error: "invalidRange" as const };
  }

  const overlapping = await prisma.slot.findFirst({
    where: { startAt: { lt: endAt }, endAt: { gt: startAt } },
  });
  if (overlapping) {
    return { error: "overlap" as const };
  }

  const slot = await prisma.slot.create({
    data: { startAt, endAt, status: SlotStatus.OPEN },
  });
  return { slot };
}

/**
 * Per-day summary for every day in the given month, for the admin
 * calendar grid: does the day have any open slots, any booked slots, and
 * is it marked as a holiday.
 */
export async function getMonthSummary(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [slots, holidays] = await Promise.all([
    prisma.slot.findMany({
      where: { startAt: { gte: start, lt: end } },
      select: { startAt: true, status: true },
    }),
    prisma.holiday.findMany({ where: { date: { gte: start, lt: end } } }),
  ]);

  const holidayDates = new Set(
    holidays.map((h) => h.date.toISOString().slice(0, 10)),
  );

  const byDate = new Map<
    string,
    { open: number; booked: number; blocked: number }
  >();
  for (const slot of slots) {
    const key = slot.startAt.toISOString().slice(0, 10);
    const entry = byDate.get(key) ?? { open: 0, booked: 0, blocked: 0 };
    if (slot.status === SlotStatus.OPEN) entry.open++;
    else if (slot.status === SlotStatus.BOOKED || slot.status === SlotStatus.HELD)
      entry.booked++;
    else if (slot.status === SlotStatus.BLOCKED) entry.blocked++;
    byDate.set(key, entry);
  }

  return [...byDate.entries()].map(([date, counts]) => ({
    date,
    ...counts,
    isHoliday: holidayDates.has(date),
  }));
}

/** Free-consultation requests, oldest first — the order staff should work
 * through the waitlist, since these have no assigned appointment slot. */
export async function listFreeBookingRequests() {
  return prisma.booking.findMany({
    where: { consultationType: { kind: ConsultationKind.FREE } },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });
}

export async function isDateHoliday(dateStr: string) {
  const { start, end } = dayBounds(dateStr);
  const holiday = await prisma.holiday.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  return holiday ?? null;
}
