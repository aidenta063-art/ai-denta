import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link, redirect } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PurpleGlowSection } from "@/components/marketing/purple-glow-section";
import { BrandedCard } from "@/components/marketing/branded-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { prisma } from "@/lib/prisma";
import { SlotStatus } from "@/generated/prisma/enums";
import { IntakeForm } from "@/components/booking/intake-form";
import { createPaidBookingHoldAction } from "@/actions/booking/create-paid-booking-hold";
import { formatSlotTimeRange } from "@/lib/timezone";
import { auth } from "@/lib/auth";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";

export default async function ConfirmPaidSlotPage({
  params,
}: {
  params: Promise<{ locale: string; slotId: string }>;
}) {
  const { locale, slotId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect({
      href: {
        pathname: "/login",
        query: { next: `/${locale}/booking/paid/${slotId}` },
      },
      locale,
    });
    return null;
  }

  const t = await getTranslations("Booking.paid");
  const [slot, steps] = await Promise.all([
    prisma.slot.findUnique({ where: { id: slotId } }),
    getIntakeFormSteps(),
  ]);

  const formattedDate = slot
    ? formatSlotTimeRange(slot.startAt, slot.endAt, locale, {
        dateStyle: "full",
      })
    : null;

  return (
    <PurpleGlowSection className="flex items-center justify-center py-24 sm:py-28">
      <BrandedCard
        title={t("confirmTitle")}
        description={formattedDate ?? undefined}
        className={
          !slot || slot.status !== SlotStatus.OPEN
            ? undefined
            : "max-w-xl lg:max-w-3xl xl:max-w-4xl"
        }
      >
        {!slot || slot.status !== SlotStatus.OPEN ? (
          <div className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertDescription>{t("slotNoLongerAvailable")}</AlertDescription>
            </Alert>
            <Button
              className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
              render={<Link href="/booking/paid" locale={locale} />}
            >
              {t("pickAnother")}
            </Button>
          </div>
        ) : (
          <IntakeForm
            locale={locale}
            steps={steps}
            action={createPaidBookingHoldAction.bind(null, locale, slotId)}
          />
        )}
      </BrandedCard>
    </PurpleGlowSection>
  );
}
