"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { BrandedCard } from "@/components/marketing/branded-card";
import { AutoplaySoundVideo } from "@/components/marketing/autoplay-sound-video";
import {
  IntakeForm,
  type IntakeFormState,
} from "@/components/booking/intake-form";
import type { IntakeStepConfig } from "@/lib/intake-fields";

export function FreeBookingGate({
  locale,
  videoUrl,
  formTitle,
  isLoggedIn,
  steps,
  action,
}: {
  locale: Locale;
  videoUrl: string | null;
  formTitle: string;
  isLoggedIn: boolean;
  steps: IntakeStepConfig[];
  action: (
    prevState: IntakeFormState,
    formData: FormData,
  ) => Promise<IntakeFormState>;
}) {
  const t = useTranslations("Booking.freeGate");
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <BrandedCard
        title={formTitle}
        className="max-w-xl lg:max-w-3xl xl:max-w-4xl"
      >
        <IntakeForm locale={locale} steps={steps} action={action} />
      </BrandedCard>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-2 text-center">
      {videoUrl && (
        <AutoplaySoundVideo videoUrl={videoUrl} className="w-full" />
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-[#EDE3F5]/80">{t("description")}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          size="lg"
          className="h-12 w-full bg-white text-base text-[#251037] shadow-xl shadow-black/20 hover:bg-white/90"
          render={<Link href="/booking/paid" locale={locale} />}
        >
          {t("paidOption")}
        </Button>
        {isLoggedIn ? (
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full border-white/30 bg-transparent text-base text-white hover:bg-white/10"
            onClick={() => setShowForm(true)}
          >
            {t("freeOption")}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full border-white/30 bg-transparent text-base text-white hover:bg-white/10"
            render={
              <Link
                href={{
                  pathname: "/login",
                  query: { next: `/${locale}/booking/free` },
                }}
                locale={locale}
              />
            }
          >
            {t("freeOption")}
          </Button>
        )}
      </div>
    </div>
  );
}
