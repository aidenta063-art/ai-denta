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

export default async function AuthLayout({
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
      <FaqChatWidget questions={questions} />
      <AnalyticsBeacon locale={locale} />
      <MetaPixel pixelId={pixelId} />
      {pixelId && <ScrollDepthTracker />}
    </MotionProvider>
  );
}
