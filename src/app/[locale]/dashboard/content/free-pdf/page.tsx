import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getFreePdfs, MAX_FREE_PDFS } from "@/services/content/cms.service";
import { PdfUploader } from "@/components/dashboard/pdf-uploader";
import {
  addFreePdfAction,
  removeFreePdfAction,
} from "@/actions/dashboard/content/free-pdf";

export default async function FreePdfContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const pdfs = await getFreePdfs();
  const addAction = addFreePdfAction.bind(null, locale);
  const removeAction = removeFreePdfAction.bind(null, locale);

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
          <h2 className="text-sm font-medium text-foreground">PDF files</h2>
          <p className="text-sm text-muted-foreground">
            The free downloadable guides, reachable from the site menu at
            &quot;Free Guide&quot;. Visitors must log in before downloading
            any of them. Up to {MAX_FREE_PDFS} files.
          </p>
        </div>
        <PdfUploader
          files={pdfs.map((pdf) => ({
            id: pdf.id,
            url: pdf.url,
            fileName: pdf.fileName,
          }))}
          maxFiles={MAX_FREE_PDFS}
          addAction={addAction}
          removeAction={removeAction}
        />
      </div>
    </div>
  );
}
