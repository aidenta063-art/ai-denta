import { cn } from "@/lib/utils";

/**
 * Decorative signature motif for the marketing hero: a lattice of
 * appointment-slot cells (echoing the real booking-slot grid in
 * /booking/paid) mostly "filled," with a few pulsing as if just booked.
 * Replaces generic blurred gradient blobs with something specific to
 * what Ai Denta actually does — fill a clinic's schedule.
 */
const GRID_PATTERN = [
  1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
  0, 1, 1, 1, 0, 1, 1, 1, 1, 0,
] as const;

const PULSE_INDICES = new Set([2, 9, 16, 23, 30, 33]);

export function ScheduleGridBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none grid grid-cols-6 gap-2", className)}
      aria-hidden
    >
      {GRID_PATTERN.map((filled, i) => (
        <span
          key={i}
          className={cn(
            "size-3 rounded-[3px] sm:size-3.5",
            filled ? "bg-[#B98AE8]/25" : "border border-white/10",
            PULSE_INDICES.has(i) &&
              filled &&
              "animate-slot-pulse bg-[#7E00C9]",
          )}
          style={
            PULSE_INDICES.has(i)
              ? { animationDelay: `${(i % 6) * 0.3}s` }
              : undefined
          }
        />
      ))}
    </div>
  );
}
