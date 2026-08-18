import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Clock, CheckCircle2, Download } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { PaymentMethodSwitcher } from "@/components/payment/payment-method-switcher";
import { getEbookOrder } from "@/services/ebook/ebook.service";
import { EbookOrderStatus, Role } from "@/generated/prisma/enums";
import { requireOwnerOrStaff } from "@/lib/authz";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";
import { KashierProvider } from "@/services/payments/providers/kashier.provider";
import { logger } from "@/lib/logger";

export default async function EbookOrderPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Ebook.order");
  const order = await getEbookOrder(orderId);
  if (!order) notFound();

  await requireOwnerOrStaff(order.userId, [Role.ADMIN, Role.STAFF], locale);

  const isPaid = order.status === EbookOrderStatus.PAID;

  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { style: "currency", currency: order.currency },
  ).format(order.amountCents / 100);

  let kashierSessionUrl: string | null = null;
  if (!isPaid) {
    try {
      const session = await new KashierProvider().createSession({
        referenceId: order.id,
        referenceType: "ebook_order",
        amountCents: order.amountCents,
        currency: order.currency,
        customerName: order.buyerName,
        customerEmail: order.buyerEmail,
        redirectUrl: `${process.env.APP_URL}/${locale}/ebook/order/${orderId}`,
      });
      kashierSessionUrl = session.redirectUrl;
    } catch (error) {
      logger.error(
        { err: error, orderId },
        "Failed to create Kashier session for ebook order",
      );
    }
  }

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      {isPaid ? (
        <TrackMetaEvent
          event="Purchase"
          params={{
            value: order.amountCents / 100,
            currency: order.currency,
            content_name: "ebook",
          }}
        />
      ) : (
        <TrackMetaEvent
          event="InitiateCheckout"
          params={{ content_name: "ebook" }}
        />
      )}
      <BrandedCard
        title={isPaid ? t("paidTitle") : t("pendingTitle")}
        description={isPaid ? t("paidDescription") : t("pendingDescription")}
        className={isPaid ? undefined : "max-w-xl lg:max-w-2xl"}
      >
        <div className="flex flex-col gap-4">
          <div
            className={`mx-auto flex size-12 items-center justify-center rounded-full ${
              isPaid
                ? "bg-green-100 text-green-600"
                : "bg-secondary text-primary"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <Clock className="size-6" />
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-secondary/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("orderLabel")}</p>
              <p className="font-medium text-foreground">
                #{order.id.slice(-8)}
              </p>
            </div>
            {isPaid && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("priceLabel")}
                </p>
                <p className="font-medium text-foreground">{formattedPrice}</p>
              </div>
            )}
          </div>

          {isPaid ? (
            <Button
              className="h-11 gap-2 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<a href={`/api/ebook/download/${order.id}`} />}
            >
              <Download className="size-4" />
              {t("downloadCta")}
            </Button>
          ) : (
            <PaymentMethodSwitcher
              kind="ebook"
              amountLabel={formattedPrice}
              reference={order.id.slice(-8)}
              sessionUrl={kashierSessionUrl}
            />
          )}
        </div>
      </BrandedCard>
    </PurpleGlowSection>
  );
}
