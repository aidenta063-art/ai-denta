import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BrandedCard } from "@/components/marketing/branded-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { routing } from "@/i18n/routing";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Auth.resetPassword");

  return (
    <BrandedCard title={t("title")}>
      <ResetPasswordForm locale={locale} token={token} />
    </BrandedCard>
  );
}
