import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { getFreePdf } from "@/services/content/cms.service";
import { auth } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FreePdf" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function FreePdfPage({
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
      href: { pathname: "/login", query: { next: `/${locale}/free-pdf` } },
      locale,
    });
    return null;
  }

  const t = await getTranslations("FreePdf");
  const pdf = await getFreePdf();

  return (
    <PurpleGlowSection className="px-4 py-24 sm:py-28">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur">
          <div
            className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
            aria-hidden
          />
          <div className="flex flex-col gap-4 p-6 sm:p-10">
            <Eyebrow className="w-fit">{t("eyebrow")}</Eyebrow>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
              </div>
              {pdf && (
                <a
                  href={pdf.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7E00C9] px-5 text-base font-medium text-white transition-colors hover:bg-[#7E00C9]/90"
                >
                  <Download className="size-4" />
                  {t("downloadCta")}
                </a>
              )}
            </div>

            {pdf ? (
              <iframe
                src={pdf.url}
                title={t("title")}
                className="mt-2 h-[70vh] w-full rounded-2xl border border-border"
              />
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <FileText className="size-8 text-muted-foreground" />
                <p className="max-w-sm text-sm text-muted-foreground">
                  {t("comingSoon")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PurpleGlowSection>
  );
}
