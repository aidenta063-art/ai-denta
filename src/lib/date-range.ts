import { APP_TIME_ZONE, zonedTimeToUtc } from "@/lib/timezone";

// Vercel's runtime is pinned to UTC, so "today" via server-local Date
// methods silently drifts from Cairo's actual calendar day. Everything
// date-range related is bucketed by Cairo date keys ("YYYY-MM-DD").

export function cairoDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function shiftDateKey(key: string, offsetDays: number): string {
  const [year, month, day] = key.split("-").map(Number);
  // Noon UTC keeps this comfortably clear of any DST-transition edge case.
  const base = new Date(Date.UTC(year, month - 1, day, 12));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

export function dateKeyToUtcStart(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return zonedTimeToUtc(year, month - 1, day, 0, 0);
}

export function isValidDateKey(value: string | undefined | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Number of calendar days from `from` to `to`, inclusive. */
export function daysBetweenInclusive(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.round(diff / 86_400_000) + 1;
}

/** UTC bounds [gte, lt) covering the Cairo days `from`..`to` inclusive.
 * Either side may be omitted for an open-ended range. */
export function dateRangeToUtcBounds(from?: string, to?: string) {
  return {
    gte: from ? dateKeyToUtcStart(from) : undefined,
    lt: to ? dateKeyToUtcStart(shiftDateKey(to, 1)) : undefined,
  };
}
