import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Clock } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { BrandedCard } from "@/components/marketing/branded-card";
import { Button } from "@/components/ui/button";
import { EbookCover } from "@/components/marketing/ebook-cover";
import { EbookOrderForm } from "@/components/ebook/ebook-order-form";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { createEbookOrderAction } from "@/actions/ebook/create-ebook-order";
import { getEbookPricing, listUserEbookOrders } from "@/services/ebook/ebook.service";
import { EbookOrderStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { TrackMetaEvent } from "@/components/marketing/track-meta-event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Ebook" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function EbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [session, ebookPricing] = await Promise.all([
    auth(),
    getEbookPricing(),
  ]);
  const orders = session?.user
    ? await listUserEbookOrders(session.user.id)
    : [];
  const paidOrder = orders.find((o) => o.status === EbookOrderStatus.PAID);
  const pendingOrder = orders.find((o) => o.status === EbookOrderStatus.PENDING);

  const t = await getTranslations("Ebook");
  const description = t.raw("description") as string[];
  const toc = t.raw("toc") as string[];

  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { style: "currency", currency: ebookPricing.currency },
  ).format(ebookPricing.priceCents / 100);

  return (
    <>
      <TrackMetaEvent
        event="ViewContent"
        params={{
          content_name: "ebook",
          value: ebookPricing.priceCents / 100,
          currency: ebookPricing.currency,
        }}
      />
      <PurpleGlowSection className="px-4 py-24 sm:py-28">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[260px_1fr]">
              <div className="mx-auto flex w-44 flex-col gap-4 sm:w-52 lg:w-full">
                <EbookCover locale={locale} />
                <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {t("priceLabel")}
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {formattedPrice}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Eyebrow className="w-fit">{t("eyebrow")}</Eyebrow>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {t("title")}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t("subtitle")}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {t("byAuthors")}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {description.map((paragraph) => (
                    <p key={paragraph} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-5">
                  <h2 className="font-semibold text-foreground">
                    {t("tocTitle")}
                  </h2>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {toc.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            {paidOrder ? (
              <BrandedCard title={t("alreadyOwned.title")}>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {t("alreadyOwned.description")}
                  </p>
                  <Button
                    className="h-11 gap-2 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
                    render={
                      <a
                        href={`/api/ebook/download/${paidOrder.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Download className="size-4" />
                    {t("alreadyOwned.cta")}
                  </Button>
                </div>
              </BrandedCard>
            ) : pendingOrder ? (
              <BrandedCard title={t("pendingOrder.title")}>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {t("pendingOrder.description")}
                  </p>
                  <Button
                    className="h-11 gap-2 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
                    render={
                      <Link
                        href={`/ebook/order/${pendingOrder.id}`}
                        locale={locale}
                      />
                    }
                  >
                    <Clock className="size-4" />
                    {t("pendingOrder.cta")}
                  </Button>
                </div>
              </BrandedCard>
            ) : (
              <BrandedCard title={t("formTitle")}>
                {session?.user ? (
                  <EbookOrderForm
                    action={createEbookOrderAction.bind(null, locale)}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      {t("loginToBuyDescription")}
                    </p>
                    <Button
                      className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
                      render={
                        <Link
                          href={{
                            pathname: "/login",
                            query: { next: `/${locale}/ebook` },
                          }}
                          locale={locale}
                        />
                      }
                    >
                      {t("submit")}
                    </Button>
                  </div>
                )}
              </BrandedCard>
            )}
          </div>
        </div>
      </PurpleGlowSection>
      <ReviewsSection />
    </>
  );
}
