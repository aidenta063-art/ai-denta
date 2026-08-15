import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listComparisonRows } from "@/services/content/cms.service";
import { deleteComparisonRowAction } from "@/actions/dashboard/content/comparison";
import { ComparisonRowForm } from "@/components/dashboard/comparison-row-form";

export default async function ComparisonContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const rows = await listComparisonRows();
  const removeAction = deleteComparisonRowAction.bind(null, locale);

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
