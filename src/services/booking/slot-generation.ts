import { prisma } from "@/lib/prisma";

const GENERATION_HORIZON_DAYS = 56;

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Expands active WorkingHoursRule x calendar days (skipping Holidays) into
 * concrete Slot rows. Idempotent via skipDuplicates against the
 * @@unique([startAt, endAt]) constraint, so it's safe to re-run whenever
 * working hours/holidays change or on a schedule to extend the horizon.
 */
export async function generateSlots({
  fromDate = toDateOnly(new Date()),
  horizonDays = GENERATION_HORIZON_DAYS,
}: {
  fromDate?: Date;
  horizonDays?: number;
} = {}) {
  const [rules, holidays] = await Promise.all([
    prisma.workingHoursRule.findMany({ where: { isActive: true } }),
    prisma.holiday.findMany({
      where: {
        date: {
          gte: fromDate,
          lte: new Date(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate() + horizonDays,
          ),
        },
      },
    }),
  ]);

  const holidayDates = new Set(
    holidays.map((h) => toDateOnly(h.date).getTime()),
  );
  const rulesByWeekday = new Map<number, typeof rules>();
  for (const rule of rules) {
    const list = rulesByWeekday.get(rule.weekday) ?? [];
    list.push(rule);
    rulesByWeekday.set(rule.weekday, list);
  }

  const slotsToCreate: { startAt: Date; endAt: Date; sourceRuleId: string }[] =
    [];

  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset++) {
    const day = new Date(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      fromDate.getDate() + dayOffset,
    );
    if (holidayDates.has(day.getTime())) continue;

    const dayRules = rulesByWeekday.get(day.getDay()) ?? [];
    for (const rule of dayRules) {
      const start = parseTime(rule.startTime);
      const end = parseTime(rule.endTime);

      let slotStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        start.hours,
        start.minutes,
      );
      const ruleEnd = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        end.hours,
        end.minutes,
      );

      while (slotStart < ruleEnd) {
        const slotEnd = new Date(
          slotStart.getTime() + rule.slotLengthMinutes * 60_000,
        );
        if (slotEnd > ruleEnd) break;

        slotsToCreate.push({
          startAt: slotStart,
          endAt: slotEnd,
          sourceRuleId: rule.id,
        });
        slotStart = slotEnd;
      }
    }
  }

  if (slotsToCreate.length === 0) {
    return { created: 0 };
  }

  const result = await prisma.slot.createMany({
    data: slotsToCreate,
    skipDuplicates: true,
  });

  return { created: result.count };
}
