import { cn } from "@/lib/utils";

/** Small-caps mono label used above section headings — the site's "data
 * voice," paired with the bolder display weight used for the headings
 * themselves. `tone="dark"` is for sections on the deep-purple background. */
export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1 font-mono text-xs tracking-widest uppercase backdrop-blur",
        tone === "dark"
          ? "border-white/15 bg-white/10 text-[#EDE3F5]"
          : "border-border bg-secondary text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
