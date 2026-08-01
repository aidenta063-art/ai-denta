import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMetaPixelId } from "@/services/content/integrations.service";
import { IntegrationsForm } from "@/components/dashboard/integrations-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const pixelId = await getMetaPixelId();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Settings</h1>

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 font-medium text-card-foreground">
          Meta (Facebook) Pixel
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Connects the site to Meta Ads Manager. Once saved, the pixel loads
          on every page and automatically tracks page views, free-consultation
          leads, paid booking schedules, and new account signups — like
          Shopify&apos;s built-in pixel, it covers every corner of the site.
        </p>
        <IntegrationsForm locale={locale} defaultPixelId={pixelId ?? ""} />
      </div>
    </div>
  );
}
