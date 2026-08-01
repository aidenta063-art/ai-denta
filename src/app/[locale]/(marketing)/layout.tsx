import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { FaqChatWidget } from "@/components/marketing/faq-chat-widget";
import { AnalyticsBeacon } from "@/components/marketing/analytics-beacon";
import { MetaPixel } from "@/components/marketing/meta-pixel";
import { MotionProvider } from "@/components/marketing/motion-provider";
import { getMetaPixelId } from "@/services/content/integrations.service";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const pixelId = await getMetaPixelId();

  return (
    <MotionProvider>
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <FaqChatWidget />
      <AnalyticsBeacon locale={locale} />
      <MetaPixel pixelId={pixelId} />
    </MotionProvider>
  );
}
