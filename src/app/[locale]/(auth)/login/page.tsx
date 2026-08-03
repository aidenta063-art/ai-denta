import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BrandedCard } from "@/components/marketing/branded-card";
import { LoginForm } from "@/components/auth/login-form";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.login" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const { next } = await searchParams;
  const t = await getTranslations("Auth.login");
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const contextDescription = next?.includes("/free-pdf")
    ? t("freePdfContext")
    : undefined;

  return (
    <BrandedCard title={t("title")} description={contextDescription}>
      <LoginForm locale={locale} googleEnabled={googleEnabled} next={next} />
    </BrandedCard>
  );
}
