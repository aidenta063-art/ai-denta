import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  listPaymentRequestRows,
  parsePaymentFilters,
} from "@/services/payments/payments-admin.service";
import { markAsPaidAction } from "@/actions/dashboard/payments/mark-as-paid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PaymentStatus, ConsultationKind } from "@/generated/prisma/enums";
import { APP_TIME_ZONE, formatSlotTimeRange } from "@/lib/timezone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { IntakeAnswersDialog } from "@/components/dashboard/intake-answers-dialog";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";

export default async function PaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const filters = parsePaymentFilters(await searchParams);
  const [rows, paidSteps, freeSteps] = await Promise.all([
    listPaymentRequestRows(filters),
    getIntakeFormSteps(ConsultationKind.PAID),
    getIntakeFormSteps(ConsultationKind.FREE),
  ]);

  const exportQuery = new URLSearchParams();
  if (filters.status) exportQuery.set("status", filters.status);
  if (filters.from) exportQuery.set("from", filters.from);
  if (filters.to) exportQuery.set("to", filters.to);
  const exportHref = `/api/dashboard/payments/export${
    exportQuery.size ? `?${exportQuery}` : ""
  }`;
  const hasFilters = Boolean(filters.status || filters.from || filters.to || filters.type);
  const markPaid = markAsPaidAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Payments</h1>
        <Button
          variant="outline"
          size="sm"
          render={<a href={exportHref} />}
        >
          {filters.status || filters.from || filters.to
            ? "Export filtered CSV"
            : "Export CSV"}
        </Button>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type ?? ""}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>
        </div>
        {filters.type !== "free" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            >
              <option value="">All</option>
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from">From</Label>
          <Input id="from" name="from" type="date" defaultValue={filters.from ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={filters.to ?? ""} />
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/payments" locale={locale} />}
          >
            Reset
          </Button>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Customer</th>
              <th className="px-4 py-2 text-start">Consultation</th>
              <th className="px-4 py-2 text-start">Type</th>
              <th className="px-4 py-2 text-start">Amount</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  {hasFilters ? "No requests match these filters." : "No requests yet."}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {row.customerName}
                  <div className="text-xs font-normal text-muted-foreground">
                    {row.customerEmail}
                  </div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.consultationName}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.kind === "paid"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {row.kind === "paid" ? "Paid" : "Free"}
                  </span>
                </td>
                <td className="px-4 py-2 text-card-foreground">
                  {row.amountCents !== null && row.currency
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: row.currency,
                      }).format(row.amountCents / 100)
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  {row.paymentStatus ? (
                    <StatusBadge status={row.paymentStatus} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeZone: APP_TIME_ZONE,
                  }).format(row.createdAt)}
                </td>
                <td className="px-4 py-2 text-end">
                  <div className="flex justify-end gap-2">
                    <IntakeAnswersDialog
                      name={row.customerName}
                      intakeAnswers={row.intakeAnswers}
                      steps={row.kind === "paid" ? paidSteps : freeSteps}
                      phone={row.customerPhone}
                      appointment={
                        row.appointment
                          ? formatSlotTimeRange(
                              row.appointment.startAt,
                              row.appointment.endAt,
                              "en",
                              { dateStyle: "medium" },
                            )
                          : null
                      }
                    />
                    {row.paymentId &&
                      (row.paymentStatus === PaymentStatus.PENDING ||
                        row.paymentStatus === PaymentStatus.FAILED) && (
                        <form action={markPaid.bind(null, row.paymentId)}>
                          <Button size="sm" type="submit">
                            Mark as Paid
                          </Button>
                        </form>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
