import { cn } from "@/lib/utils";

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
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[#7E00C9] opacity-40 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-[#B98AE8] opacity-30 blur-[110px]"
        aria-hidden
      />
      <div className="relative w-full">{children}</div>
    </section>
  );
}
