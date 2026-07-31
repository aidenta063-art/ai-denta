export const APP_TIME_ZONE = "Africa/Cairo";

/** "2:00 – 2:30 PM" — the slot's full start–end time range, so the
 * appointment's duration is visible wherever a slot time is shown. */
export function formatSlotTimeRange(
  start: Date,
  end: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    timeZone: APP_TIME_ZONE,
    timeStyle: "short",
    ...options,
  }).formatRange(start, end);
}

/**
 * Converts a wall-clock date/time in APP_TIME_ZONE to the equivalent UTC
 * Date. Vercel's Node runtime is pinned to UTC and won't let us override
 * process.env.TZ, so slot generation has to do this conversion explicitly
 * instead of relying on the server's local timezone.
 */
export function zonedTimeToUtc(
  year: number,
  month: number, // 0-indexed, matches the Date constructor
  day: number,
  hours: number,
  minutes: number,
): Date {
  const utcGuess = new Date(Date.UTC(year, month, day, hours, minutes));

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(utcGuess)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  const offset = asIfUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}
