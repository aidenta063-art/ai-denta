import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ShoppingBag, Download, Gift } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { auth } from "@/lib/auth";
import { listUserPaidEbookOrders } from "@/services/ebook/ebook.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Purchases" });
  return { title: t("title") };
}

export default async function PurchasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Purchases");
  const tEbook = await getTranslations("Ebook");

  const ebookOrders = await listUserPaidEbookOrders(session.user.id);

  return (
    <PurpleGlowSection className="px-4 py-24 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <h1 className="mb-4 text-lg font-bold text-foreground">
            {t("title")}
          </h1>

          {ebookOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-secondary/50 px-6 py-10 text-center">
              <ShoppingBag className="size-8 text-primary" />
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
              <Button
                className="h-10 bg-[#7E00C9] hover:bg-[#7E00C9]/90"
                render={<Link href="/ebook" locale={locale} />}
              >
                {t("browseEbook")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ebookOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {tEbook("title")}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {order.amountCents === 0 && (
                        <Gift className="size-3.5 text-[#7E00C9]" />
                      )}
                      {order.amountCents === 0
                        ? t("freeGift")
                        : order.paidAt
                          ? new Intl.DateTimeFormat(
                              locale === "ar" ? "ar-EG" : "en-US",
                              { dateStyle: "medium" },
                            ).format(order.paidAt)
                          : null}
                    </p>
                  </div>
                  <Button
                    className="h-10 w-fit gap-2 bg-[#7E00C9] hover:bg-[#7E00C9]/90"
                    render={<a href={`/api/ebook/download/${order.id}`} />}
                  >
                    <Download className="size-4" />
                    {t("downloadCta")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PurpleGlowSection>
  );
}
