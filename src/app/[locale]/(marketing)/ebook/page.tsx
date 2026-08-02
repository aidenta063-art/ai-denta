import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { EbookCover } from "@/components/marketing/ebook-cover";
import { EbookOrderForm } from "@/components/ebook/ebook-order-form";
import { createEbookOrderAction } from "@/actions/ebook/create-ebook-order";
import { PATIENT_FLOW_EBOOK } from "@/lib/ebook";
import { auth } from "@/lib/auth";

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

  const session = await auth();
  if (!session?.user) {
    redirect({
      href: { pathname: "/login", query: { next: `/${locale}/ebook` } },
      locale,
    });
    return null;
  }

  const t = await getTranslations("Ebook");
  const description = t.raw("description") as string[];
  const toc = t.raw("toc") as string[];

  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    { style: "currency", currency: PATIENT_FLOW_EBOOK.currency },
  ).format(PATIENT_FLOW_EBOOK.priceCents / 100);

  return (
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
                <span className="w-fit rounded-full border border-border bg-secondary px-4 py-1 text-sm font-medium text-primary">
                  {t("eyebrow")}
                </span>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
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
          <BrandedCard title={t("formTitle")}>
            <EbookOrderForm action={createEbookOrderAction.bind(null, locale)} />
          </BrandedCard>
        </div>
      </div>
    </PurpleGlowSection>
  );
}
