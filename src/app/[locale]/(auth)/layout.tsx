import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SocialFab } from "@/components/marketing/social-fab";
import { MotionProvider } from "@/components/marketing/motion-provider";

export default async function AuthLayout({
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
      <main className="flex flex-1 items-center justify-center bg-secondary/40 px-4 py-16">
        {children}
      </main>
      <MarketingFooter />
      <SocialFab />
    </MotionProvider>
  );
}
