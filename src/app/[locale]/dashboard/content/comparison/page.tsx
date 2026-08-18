import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listComparisonRows,
  getComparisonHeaderContent,
} from "@/services/content/cms.service";
import { deleteComparisonRowAction } from "@/actions/dashboard/content/comparison";
import { ComparisonRowForm } from "@/components/dashboard/comparison-row-form";
import { ComparisonHeaderForm } from "@/components/dashboard/comparison-header-form";
import { comparisonHeaderContentSchema } from "@/lib/validation/cms.schema";

export default async function ComparisonContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [rows, headerSection, tEn, tAr] = await Promise.all([
    listComparisonRows(),
    getComparisonHeaderContent(),
    getTranslations({ locale: "en", namespace: "HomePage.comparison" }),
    getTranslations({ locale: "ar", namespace: "HomePage.comparison" }),
  ]);
  const removeAction = deleteComparisonRowAction.bind(null, locale);

  const enParsed = headerSection
    ? comparisonHeaderContentSchema.safeParse(headerSection.contentEn)
    : null;
  const arParsed = headerSection
    ? comparisonHeaderContentSchema.safeParse(headerSection.contentAr)
    : null;

  const headerDefaults = {
    eyebrowEn: enParsed?.success ? enParsed.data.eyebrow : tEn("eyebrow"),
    titleEn: enParsed?.success ? enParsed.data.title : tEn("title"),
    subtitleEn: enParsed?.success ? enParsed.data.subtitle : tEn("subtitle"),
    featureLabelEn: enParsed?.success
      ? enParsed.data.featureLabel
      : tEn("featureLabel"),
    freeNameEn: enParsed?.success ? enParsed.data.freeName : tEn("freeName"),
    paidNameEn: enParsed?.success ? enParsed.data.paidName : tEn("paidName"),
    mostPopularEn: enParsed?.success
      ? enParsed.data.mostPopular
      : tEn("mostPopular"),
    eyebrowAr: arParsed?.success ? arParsed.data.eyebrow : tAr("eyebrow"),
    titleAr: arParsed?.success ? arParsed.data.title : tAr("title"),
    subtitleAr: arParsed?.success ? arParsed.data.subtitle : tAr("subtitle"),
    featureLabelAr: arParsed?.success
      ? arParsed.data.featureLabel
      : tAr("featureLabel"),
    freeNameAr: arParsed?.success ? arParsed.data.freeName : tAr("freeName"),
    paidNameAr: arParsed?.success ? arParsed.data.paidName : tAr("paidName"),
    mostPopularAr: arParsed?.success
      ? arParsed.data.mostPopular
      : tAr("mostPopular"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Free vs. Paid Comparison
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Table header</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonHeaderForm locale={locale} defaults={headerDefaults} />
        </CardContent>
      </Card>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No custom rows yet — the homepage is showing its built-in default
          comparison (scheduling, duration, session depth, priority, price)
          until you add a row below.
        </p>
      )}

      {rows.map((row) => (
        <Card key={row.id}>
          <CardHeader>
            <CardTitle className="text-base">{row.labelEn}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ComparisonRowForm locale={locale} row={row} />
            <form action={removeAction.bind(null, row.id)}>
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a row</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonRowForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
