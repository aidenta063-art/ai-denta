import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getHeroContent } from "@/services/content/cms.service";
import { HeroContentForm } from "@/components/dashboard/hero-content-form";
import { heroContentSchema } from "@/lib/validation/cms.schema";

export default async function HeroContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [section, tEn, tAr] = await Promise.all([
    getHeroContent(),
    getTranslations({ locale: "en", namespace: "HomePage" }),
    getTranslations({ locale: "ar", namespace: "HomePage" }),
  ]);

  const enParsed = section
    ? heroContentSchema.safeParse(section.contentEn)
    : null;
  const arParsed = section
    ? heroContentSchema.safeParse(section.contentAr)
    : null;

  const defaults = {
    eyebrowEn: enParsed?.success ? enParsed.data.eyebrow : tEn("eyebrow"),
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    eyebrowAr: arParsed?.success ? arParsed.data.eyebrow : tAr("eyebrow"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Homepage Hero
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <div className="max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <HeroContentForm locale={locale} defaults={defaults} />
      </div>
    </div>
  );
}
