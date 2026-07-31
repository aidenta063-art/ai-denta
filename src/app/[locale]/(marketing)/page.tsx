import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/marketing/hero";
import { ServicesSection } from "@/components/marketing/services-section";
import { VideoShowcase } from "@/components/marketing/video-showcase";
import { WhyUsSection } from "@/components/marketing/why-us-section";
import { ConsultationCta } from "@/components/marketing/consultation-cta";
import { getHeroContent, getHeroVideo } from "@/services/content/cms.service";
import { heroContentSchema } from "@/lib/validation/cms.schema";
import { localized } from "@/lib/i18n-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const heroSection = await getHeroContent();

  const heroFromCms = heroSection
    ? heroContentSchema.safeParse(
        locale === "ar" ? heroSection.contentAr : heroSection.contentEn,
      )
    : null;

  const hero = heroFromCms?.success
    ? heroFromCms.data
    : { title: t("title"), subtitle: t("subtitle") };

  return {
    title: hero.title,
    description: hero.subtitle,
    openGraph: { title: hero.title, description: hero.subtitle },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const [heroSection, heroVideo] = await Promise.all([
    getHeroContent(),
    getHeroVideo(),
  ]);

  const heroFromCms = heroSection
    ? heroContentSchema.safeParse(
        localized(locale, heroSection.contentEn, heroSection.contentAr),
      )
    : null;

  const hero = heroFromCms?.success
    ? heroFromCms.data
    : { eyebrow: t("eyebrow"), title: t("title"), subtitle: t("subtitle") };

  return (
    <>
      <Hero
        locale={locale}
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        ctaFree={t("ctaFree")}
        ctaPaid={t("ctaPaid")}
        videoUrl={heroVideo?.url}
      />
      <ServicesSection locale={locale} />
      <VideoShowcase />
      <WhyUsSection />
      <ConsultationCta locale={locale} />
    </>
  );
}
