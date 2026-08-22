import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Clock, Download, Gift, ArrowRight } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { PaymentMethodSwitcher } from "@/components/payment/payment-method-switcher";
import {
  getEbookOrder,
  confirmEbookOrderFromGateway,
} from "@/services/ebook/ebook.service";
import { EbookOrderStatus, PaymentProviderName, Role } from "@/generated/prisma/enums";
import { requireOwnerOrStaff } from "@/lib/authz";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";
import { KashierProvider } from "@/services/payments/providers/kashier.provider";
import { prisma } from "@/lib/prisma";
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

  let isPaid = order.status === EbookOrderStatus.PAID;

  // Fallback for a delayed or lost webhook: if we already have a Kashier
  // session on file for this order, check its real status directly
  // before assuming it's still pending.
  if (!isPaid && order.providerRefId) {
    try {
      const result = await new KashierProvider().verify(order.providerRefId);
      if (result.status === "PAID") {
        await confirmEbookOrderFromGateway({
          orderId: order.id,
          provider: PaymentProviderName.KASHIER,
          providerRefId: order.providerRefId,
          providerPayload: { source: "redirect-verify" },
          amountCents: result.amountCents ?? order.amountCents,
        });
        isPaid = true;
      }
    } catch (error) {
      logger.error(
        { err: error, orderId },
        "Failed to verify Kashier session status on redirect",
      );
    }
  }

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
      if (session.providerRefId) {
        await prisma.ebookOrder.update({
          where: { id: order.id },
          data: { providerRefId: session.providerRefId },
        });
      }
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
        <>
          <TrackMetaEvent
            event="Purchase"
            params={{
              value: order.amountCents / 100,
              currency: order.currency,
              content_name: "ebook",
            }}
          />
          <TrackMetaEvent
            event="EbookGiftClaimed"
            custom
            params={{ content_name: "ebook" }}
          />
        </>
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
              <Gift className="size-6" />
            ) : (
              <Clock className="size-6" />
            )}
          </div>

          {isPaid && (
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-[#7E00C9]/10 px-3 py-1 text-xs font-semibold text-[#7E00C9]">
              <Gift className="size-3.5" />
              {t("giftBadge")}
            </span>
          )}

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
                <p className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {formattedPrice}
                  </span>
                  <span className="font-semibold text-[#7E00C9]">
                    {t("freeGiftLabel")}
                  </span>
                </p>
              </div>
            )}
          </div>

          {isPaid ? (
            <>
              <Button
                className="h-11 gap-2 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
                render={
                  <a
                    href={`/api/ebook/download/${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Download className="size-4" />
                {t("downloadCta")}
              </Button>

              <div className="flex flex-col gap-3 rounded-2xl border border-[#7E00C9]/20 bg-gradient-to-br from-[#7E00C9]/5 to-transparent p-4">
                <p className="text-sm font-semibold text-[#7E00C9]">
                  {t("upsell.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("upsell.description")}
                </p>
                <Button
                  variant="outline"
                  className="h-10 w-fit gap-2 border-[#7E00C9]/40 text-[#7E00C9] hover:bg-[#7E00C9]/10"
                  render={<Link href="/booking/paid" locale={locale} />}
                >
                  {t("upsell.cta")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </>
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
