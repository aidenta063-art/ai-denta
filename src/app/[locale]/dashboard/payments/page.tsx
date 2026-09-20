import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  listPayments,
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
  const [payments, steps] = await Promise.all([
    listPayments(filters),
    getIntakeFormSteps(ConsultationKind.PAID),
  ]);

  const exportQuery = new URLSearchParams();
  if (filters.status) exportQuery.set("status", filters.status);
  if (filters.from) exportQuery.set("from", filters.from);
  if (filters.to) exportQuery.set("to", filters.to);
  const exportHref = `/api/dashboard/payments/export${
    exportQuery.size ? `?${exportQuery}` : ""
  }`;
  const hasFilters = exportQuery.size > 0;
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
          {hasFilters ? "Export filtered CSV" : "Export CSV"}
        </Button>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Customer</th>
              <th className="px-4 py-2 text-start">Consultation</th>
              <th className="px-4 py-2 text-start">Amount</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  {hasFilters ? "No payments match these filters." : "No payments yet."}
                </td>
              </tr>
            )}
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {payment.booking.user?.name ?? payment.booking.guestName}
                  <div className="text-xs font-normal text-muted-foreground">
                    {payment.booking.user?.email ?? payment.booking.guestEmail}
                  </div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {payment.booking.consultationType.nameEn}
                </td>
                <td className="px-4 py-2 text-card-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: payment.currency,
                  }).format(payment.amountCents / 100)}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeZone: APP_TIME_ZONE,
                  }).format(payment.createdAt)}
                </td>
                <td className="px-4 py-2 text-end">
                  <div className="flex justify-end gap-2">
                    <IntakeAnswersDialog
                      name={
                        payment.booking.user?.name ??
                        payment.booking.guestName ??
                        "Guest"
                      }
                      intakeAnswers={payment.booking.intakeAnswers}
                      steps={steps}
                      phone={
                        payment.booking.guestPhone ?? payment.booking.user?.phone
                      }
                      appointment={
                        payment.booking.slot
                          ? formatSlotTimeRange(
                              payment.booking.slot.startAt,
                              payment.booking.slot.endAt,
                              "en",
                              { dateStyle: "medium" },
                            )
                          : null
                      }
                    />
                    {(payment.status === PaymentStatus.PENDING ||
                      payment.status === PaymentStatus.FAILED) && (
                      <form action={markPaid.bind(null, payment.id)}>
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
