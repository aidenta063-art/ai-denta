const DOT_STYLES: Record<string, string> = {
  OPEN: "bg-green-500",
  BOOKED: "bg-blue-500",
  HELD: "bg-amber-500",
  BLOCKED: "bg-gray-400",
  CONFIRMED: "bg-green-500",
  PENDING_PAYMENT: "bg-amber-500",
  CANCELLED: "bg-gray-400",
  EXPIRED: "bg-gray-400",
  PENDING: "bg-amber-500",
  PAID: "bg-green-500",
  FAILED: "bg-red-500",
  REFUNDED: "bg-gray-400",
  MANUALLY_MARKED_PAID: "bg-green-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
      <span
        className={`size-1.5 rounded-full ${DOT_STYLES[status] ?? "bg-gray-400"}`}
      />
      {status.replaceAll("_", " ")}
    </span>
  );
}
