import { BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { EbookCover } from "@/components/marketing/ebook-cover";
import { Eyebrow } from "@/components/marketing/eyebrow";

export async function EbookTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations("HomePage.ebookTeaser");

  return (
    <section className="bg-secondary/40 px-6 py-20">
      <ScrollReveal className="mx-auto max-w-5xl">
        <Link
          href="/ebook"
          locale={locale}
          className="group flex flex-col items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-xl sm:flex-row sm:gap-10 sm:p-10"
        >
          <EbookCover locale={locale} className="w-36 shrink-0 sm:w-44" />

          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-start">
            <Eyebrow>
              <BookOpen className="size-3.5" />
              {t("eyebrow")}
            </Eyebrow>
            <h2 className="max-w-md text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h2>
            <p className="max-w-md text-muted-foreground">{t("subtitle")}</p>
            <span className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-[#7E00C9] px-6 text-base font-medium text-white transition-colors group-hover:bg-[#7E00C9]/90">
              {t("cta")}
            </span>
          </div>
        </Link>
      </ScrollReveal>
    </section>
  );
}
