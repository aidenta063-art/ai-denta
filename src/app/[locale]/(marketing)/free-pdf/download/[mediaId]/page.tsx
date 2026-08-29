import { hasLocale } from "next-intl";
import { notFound, redirect as redirectToUrl } from "next/navigation";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getFreePdfs } from "@/services/content/cms.service";

export default async function FreePdfDownloadPage({
  params,
}: {
  params: Promise<{ locale: string; mediaId: string }>;
}) {
  const { locale, mediaId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const session = await auth();
  if (!session?.user) {
    redirect({
      href: {
        pathname: "/login",
        query: { next: `/${locale}/free-pdf/download/${mediaId}` },
      },
      locale,
    });
    return null;
  }

  const pdfs = await getFreePdfs();
  const pdf = pdfs.find((p) => p.id === mediaId);
  if (!pdf) notFound();

  redirectToUrl(pdf.url);
}
