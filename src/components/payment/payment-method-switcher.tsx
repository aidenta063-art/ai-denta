"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentPanel } from "@/components/payment/payment-panel";
import { KashierCardPanel } from "@/components/payment/kashier-card-panel";

/** Card payment (Kashier) is the default, primary path — falls back to
 * the manual InstaPay/Vodafone Cash flow if no session could be created
 * (e.g. Kashier misconfigured or briefly down) or if the customer taps
 * "pay another way". */
export function PaymentMethodSwitcher({
  kind,
  amountLabel,
  reference,
  sessionUrl,
}: {
  kind: "booking" | "ebook";
  amountLabel: string;
  reference: string;
  sessionUrl: string | null;
}) {
  const t = useTranslations("Payment");
  const [showManual, setShowManual] = useState(!sessionUrl);

  if (showManual || !sessionUrl) {
    return (
      <div className="flex flex-col gap-3">
        <PaymentPanel kind={kind} amountLabel={amountLabel} reference={reference} />
        {sessionUrl && (
          <button
            type="button"
            onClick={() => setShowManual(false)}
            className="self-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("backToCard")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <KashierCardPanel sessionUrl={sessionUrl} amountLabel={amountLabel} />
      <button
        type="button"
        onClick={() => setShowManual(true)}
        className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("payAnotherWay")}
      </button>
    </div>
  );
}
