import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { FaqChatWidget } from "@/components/marketing/faq-chat-widget";
import { AnalyticsBeacon } from "@/components/marketing/analytics-beacon";
import { MetaPixel } from "@/components/marketing/meta-pixel";
import { ScrollDepthTracker } from "@/components/marketing/scroll-depth-tracker";
import { MotionProvider } from "@/components/marketing/motion-provider";
import { getMetaPixelId } from "@/services/content/integrations.service";
import { getFaqQuestions } from "@/services/content/faq-chat.service";
import { localized } from "@/lib/i18n-content";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [pixelId, faqQuestions] = await Promise.all([
    getMetaPixelId(),
    getFaqQuestions(),
  ]);
  const questions = faqQuestions.map((q) => ({
    q: localized(locale, q.qEn, q.qAr),
    a: localized(locale, q.aEn, q.aAr),
  }));

  return (
    <MotionProvider>
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter locale={locale} />
      <FaqChatWidget questions={questions} />
      <AnalyticsBeacon locale={locale} />
      <MetaPixel pixelId={pixelId} />
      {pixelId && <ScrollDepthTracker />}
    </MotionProvider>
  );
}
