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

export default async function AuthLayout({
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
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#251037] px-4 py-28 sm:py-32">
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[#7E00C9] opacity-40 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-[#B98AE8] opacity-30 blur-[110px]"
          aria-hidden
        />
        {children}
      </main>
      <MarketingFooter locale={locale} />
      <FaqChatWidget />
      <AnalyticsBeacon locale={locale} />
      <MetaPixel pixelId={pixelId} />
    </MotionProvider>
  );
}
