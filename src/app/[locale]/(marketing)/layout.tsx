import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SocialFab } from "@/components/marketing/social-fab";
import { FaqChatWidget } from "@/components/marketing/faq-chat-widget";
import { MotionProvider } from "@/components/marketing/motion-provider";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <MotionProvider>
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <SocialFab />
      <FaqChatWidget />
    </MotionProvider>
  );
}
