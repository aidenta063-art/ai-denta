import { cn } from "@/lib/utils";
import { ScheduleGridBackdrop } from "@/components/marketing/schedule-grid-backdrop";

export function PurpleGlowSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#251037] px-4 py-16 sm:py-20",
        className,
      )}
    >
      <ScheduleGridBackdrop className="pointer-events-none absolute -top-4 -left-6 hidden opacity-70 sm:grid" />
      <ScheduleGridBackdrop className="pointer-events-none absolute -right-6 bottom-0 hidden opacity-50 sm:grid" />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}
