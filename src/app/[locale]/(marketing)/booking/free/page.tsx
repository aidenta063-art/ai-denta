import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { IntakeForm } from "@/components/booking/intake-form";
import { createFreeBookingAction } from "@/actions/booking/create-free-booking";
import { auth } from "@/lib/auth";
import { hasUsedFreeConsultation } from "@/services/booking/booking.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking.free" });
  return { title: t("title"), description: t("description") };
}

export default async function FreeBookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Booking.free");

  const session = await auth();
  const alreadyUsed = session?.user
    ? await hasUsedFreeConsultation(session.user.id)
    : false;

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <BrandedCard
        title={t("title")}
        description={alreadyUsed ? t("description") : undefined}
        className={alreadyUsed ? undefined : "max-w-xl lg:max-w-2xl"}
      >
        {alreadyUsed ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("alreadyUsed")}
            </p>
            <Button
              className="h-11 w-full bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<Link href="/booking" locale={locale} />}
            >
              {t("viewPaidOption")}
            </Button>
          </div>
        ) : (
          <IntakeForm action={createFreeBookingAction.bind(null, locale)} />
        )}
      </BrandedCard>
    </PurpleGlowSection>
  );
}
