import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { listPayments } from "@/services/payments/payments-admin.service";
import { markAsPaidAction } from "@/actions/dashboard/payments/mark-as-paid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PaymentStatus } from "@/generated/prisma/enums";
import { APP_TIME_ZONE } from "@/lib/timezone";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const payments = await listPayments();
  const markPaid = markAsPaidAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Payments</h1>
        <Button
          variant="outline"
          size="sm"
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from an API route, not an app page
          render={<a href="/api/dashboard/payments/export" />}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
                  No payments yet.
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
                  {payment.status === PaymentStatus.PENDING && (
                    <form action={markPaid.bind(null, payment.id)}>
                      <Button size="sm" type="submit">
                        Mark as Paid
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
