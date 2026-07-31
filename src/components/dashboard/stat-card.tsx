import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -top-8 -right-8 size-28 rounded-full bg-primary/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7E00C9] to-[#B98AE8] text-white shadow-sm shadow-primary/30">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
