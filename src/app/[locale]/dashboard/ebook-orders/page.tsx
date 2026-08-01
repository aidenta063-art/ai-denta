import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { listEbookOrders } from "@/services/ebook/ebook.service";
import { markEbookOrderPaidAction } from "@/actions/dashboard/ebook/mark-order-paid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EbookOrderStatus } from "@/generated/prisma/enums";
import { APP_TIME_ZONE } from "@/lib/timezone";

export default async function EbookOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const orders = await listEbookOrders();
  const markPaid = markEbookOrderPaidAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Ebook Orders
        </h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Buyer</th>
              <th className="px-4 py-2 text-start">Amount</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  No ebook orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {order.user?.name ?? order.buyerName}
                  <div className="text-xs font-normal text-muted-foreground">
                    {order.user?.email ?? order.buyerEmail}
                  </div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {order.buyerPhone}
                  </div>
                </td>
                <td className="px-4 py-2 text-card-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: order.currency,
                  }).format(order.amountCents / 100)}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeZone: APP_TIME_ZONE,
                  }).format(order.createdAt)}
                </td>
                <td className="px-4 py-2 text-end">
                  {order.status === EbookOrderStatus.PENDING && (
                    <form action={markPaid.bind(null, order.id)}>
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
