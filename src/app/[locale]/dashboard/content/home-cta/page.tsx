import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getHomeCtaContent } from "@/services/content/cms.service";
import { homeCtaContentSchema } from "@/lib/validation/cms.schema";
import { HomeCtaForm } from "@/components/dashboard/home-cta-form";

export default async function HomeCtaContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [section, tEn, tAr] = await Promise.all([
    getHomeCtaContent(),
    getTranslations({ locale: "en", namespace: "HomePage.cta" }),
    getTranslations({ locale: "ar", namespace: "HomePage.cta" }),
  ]);

  const enParsed = section
    ? homeCtaContentSchema.safeParse(section.contentEn)
    : null;
  const arParsed = section
    ? homeCtaContentSchema.safeParse(section.contentAr)
    : null;

  const defaults = {
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
    isActive: section?.isActive ?? true,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Homepage Final CTA
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        The purple &quot;Ready to grow your clinic?&quot; banner near the
        bottom of the homepage.
      </p>
      <HomeCtaForm locale={locale} defaults={defaults} />
    </div>
  );
}
