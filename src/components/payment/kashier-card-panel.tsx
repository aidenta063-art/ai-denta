"use client";

import { useRef, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, useSpring } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * The card mockup is decorative — Kashier's iframe (a separate origin) is
 * where card details actually get typed, so this can't sync to real
 * keystrokes without breaking the security boundary that keeps raw card
 * data off our server. It still earns its keep: an on-load flip reveal,
 * a shimmer sweep, and a mouse-tilt make the surrounding page feel alive
 * while the real, secure form sits in the iframe below.
 */
export function KashierCardPanel({
  sessionUrl,
  amountLabel,
}: {
  sessionUrl: string;
  amountLabel: string;
}) {
  const t = useTranslations("Payment");
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 14);
    rotateX.set(-py * 14);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-secondary/50 p-4">
        <span className="text-sm text-muted-foreground">{t("amountDue")}</span>
        <span className="text-xl font-bold text-foreground">{amountLabel}</span>
      </div>

      <div className="mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#7E00C9] via-[#5c2482] to-[#251037] p-5 text-white shadow-2xl shadow-[#7E00C9]/40"
        >
          <div
            className="motion-safe:animate-card-shimmer pointer-events-none absolute -inset-y-10 left-0 w-1/3 bg-white/10 blur-xl"
            aria-hidden
          />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-8 w-11 rounded-md bg-gradient-to-br from-white/50 to-white/10 backdrop-blur" />
              <span className="text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                Ai Denta
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-lg tracking-[0.25em] sm:text-xl">
                •••• •••• •••• ••••
              </p>
              <div className="flex items-end justify-between">
                <span className="text-xs tracking-wide text-white/60 uppercase">
                  {amountLabel}
                </span>
                <span className="text-lg font-bold text-white italic">VISA</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        {t("securedByKashier")}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <iframe
          src={sessionUrl}
          title="Kashier secure payment"
          className="h-[560px] w-full"
        />
      </div>
    </div>
  );
}
