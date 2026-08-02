import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getFreePdf } from "@/services/content/cms.service";
import { PdfUploader } from "@/components/dashboard/pdf-uploader";
import {
  setFreePdfAction,
  clearFreePdfAction,
} from "@/actions/dashboard/content/free-pdf";

export default async function FreePdfContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const pdf = await getFreePdf();
  const setAction = setFreePdfAction.bind(null, locale);
  const clearAction = clearFreePdfAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Free Guide (PDF)
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <div className="flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-medium text-foreground">PDF file</h2>
          <p className="text-sm text-muted-foreground">
            The free downloadable guide, reachable from the site menu at
            &quot;Free Guide&quot;. Upload a new file to replace the current
            one.
          </p>
        </div>
        <PdfUploader
          currentFileUrl={pdf?.url ?? null}
          setAction={setAction}
          clearAction={clearAction}
        />
      </div>
    </div>
  );
}
