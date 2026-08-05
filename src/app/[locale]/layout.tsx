import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { routing } from "@/i18n/routing";
import "@fontsource-variable/cairo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: {
      template: "%s | Ai Denta",
      default: `Ai Denta — ${t("eyebrow")}`,
    },
    description: t("subtitle"),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "Ai Denta",
      statusBarStyle: "black-translucent",
    },
    openGraph: {
      siteName: "Ai Denta",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    verification: {
      google: "OS9uQiKaCT9O5Jzjl79WZUXmmg7Jbhs1YYufYy-LGoI",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#251037",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <DirectionProvider direction={direction}>
            {children}
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
