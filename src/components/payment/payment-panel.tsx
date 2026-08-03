"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PAYMENT_METHODS, WHATSAPP_NUMBER } from "@/lib/payment";

/**
 * Manual payment step shown while a paid booking or the ebook order is
 * still unpaid: amount due, InstaPay/Vodafone Cash details, and a
 * WhatsApp hand-off for the payment screenshot staff confirm against.
 * `kind` picks the right phrasing ("your booking" vs "your order") for
 * the shared copy under the Payment.<kind>.* translation keys.
 */
export function PaymentPanel({
  kind,
  amountLabel,
  reference,
}: {
  kind: "booking" | "ebook";
  amountLabel: string;
  reference: string;
}) {
  const t = useTranslations("Payment");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(PAYMENT_METHODS.vodafoneCashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. no secure context) — the number
      // is still visible on screen for the user to copy manually.
    }
  }

  const whatsappMessage = t(`${kind}.whatsappMessage`, { reference });
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="received"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-6 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="size-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t(`${kind}.receivedTitle`)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`${kind}.receivedDescription`)}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="instructions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between rounded-2xl bg-secondary/50 p-4">
            <span className="text-sm text-muted-foreground">
              {t("amountDue")}
            </span>
            <span className="text-xl font-bold text-foreground">
              {amountLabel}
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <span className="text-sm font-medium text-foreground">
              {t("instapayLabel")}
            </span>
            <Button
              variant="outline"
              className="h-11 w-full justify-center text-base"
              render={
                <a
                  href={PAYMENT_METHODS.instapayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {t("instapayCta")}
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <span className="text-sm font-medium text-foreground">
              {t("vodafoneCashLabel")}
            </span>
            <div className="flex items-center gap-2">
              <span
                dir="ltr"
                className="flex-1 rounded-lg bg-secondary/60 px-3.5 py-2.5 text-center text-base font-semibold tracking-wide text-foreground"
              >
                {PAYMENT_METHODS.vodafoneCashNumber}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={copyNumber}
                aria-label={t("copyNumber")}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            {copied && (
              <span className="text-xs text-green-600">{t("copied")}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{t("instructions")}</p>

          <Alert>
            <AlertDescription>{t(`${kind}.proofNotice`)}</AlertDescription>
          </Alert>

          <Button
            className="h-12 gap-2 bg-[#25D366] text-base text-white hover:bg-[#25D366]/90"
            onClick={() => setSent(true)}
            render={
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" />
            }
          >
            <MessageCircle className="size-4" />
            {t("sendProofCta")}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
