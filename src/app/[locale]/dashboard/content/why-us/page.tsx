import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getWhyUsContent } from "@/services/content/cms.service";
import { whyUsContentSchema } from "@/lib/validation/cms.schema";
import { WhyUsForm } from "@/components/dashboard/why-us-form";

export default async function WhyUsContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [section, tEn, tAr] = await Promise.all([
    getWhyUsContent(),
    getTranslations({ locale: "en", namespace: "HomePage.whyUs" }),
    getTranslations({ locale: "ar", namespace: "HomePage.whyUs" }),
  ]);

  const enParsed = section ? whyUsContentSchema.safeParse(section.contentEn) : null;
  const arParsed = section ? whyUsContentSchema.safeParse(section.contentAr) : null;

  const fallbackItems = (t: typeof tEn) =>
    [0, 1, 2].map((i) => ({
      title: t(`items.${i}.title`),
      description: t(`items.${i}.description`),
    })) as [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ];

  const defaults = {
    eyebrowEn: enParsed?.success ? enParsed.data.eyebrow : tEn("eyebrow"),
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    eyebrowAr: arParsed?.success ? arParsed.data.eyebrow : tAr("eyebrow"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
    itemsEn: enParsed?.success
      ? (enParsed.data.items as [
          { title: string; description: string },
          { title: string; description: string },
          { title: string; description: string },
        ])
      : fallbackItems(tEn),
    itemsAr: arParsed?.success
      ? (arParsed.data.items as [
          { title: string; description: string },
          { title: string; description: string },
          { title: string; description: string },
        ])
      : fallbackItems(tAr),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Why Choose Us
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
        The &quot;What sets us apart&quot; section on the homepage — eyebrow,
        title, subtitle, and its 3 cards.
      </p>
      <WhyUsForm locale={locale} defaults={defaults} />
    </div>
  );
}
