"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero({
  locale,
  eyebrow,
  title,
  subtitle,
  ctaFree,
  ctaPaid,
  videoUrl,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaFree: string;
  ctaPaid: string;
  videoUrl?: string | null;
}) {
  return (
    <section className="relative overflow-hidden bg-[#251037]">
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[#7E00C9] opacity-40 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-[#B98AE8] opacity-30 blur-[110px]"
        aria-hidden
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28"
      >
        <motion.span
          variants={item}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-[#EDE3F5] backdrop-blur"
        >
          {eyebrow}
        </motion.span>

        {videoUrl && (
          <motion.div variants={item} className="w-full">
            <HeroVideo videoUrl={videoUrl} />
          </motion.div>
        )}

        <motion.h1
          variants={item}
          className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-2xl text-lg text-[#EDE3F5]/80 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="bg-white text-base text-[#251037] shadow-xl shadow-black/20 hover:bg-white/90"
            render={<Link href="/booking/paid" locale={locale} />}
          >
            {ctaPaid}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            render={<Link href="/booking/free" locale={locale} />}
          >
            {ctaFree}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Browsers block autoplay-with-sound outright (the play() promise
 * rejects, it doesn't just start muted) unless the site already has a
 * high media-engagement score with this visitor. So: try unmuted first;
 * if that's blocked, fall back to muted autoplay and surface a one-tap
 * "enable sound" button instead of making people hunt for the native
 * mute control.
 */
function HeroVideo({ videoUrl }: { videoUrl: string }) {
  const t = useTranslations("HomePage");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsUnmute, setNeedsUnmute] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.play().catch(() => {
      el.muted = true;
      setNeedsUnmute(true);
      el.play().catch(() => {});
    });
  }, []);

  function enableSound() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    setNeedsUnmute(false);
    el.play().catch(() => {});
  }

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50">
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
        aria-hidden
      />
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        loop
        playsInline
        preload="auto"
        className="aspect-video w-full"
      />
      {needsUnmute && (
        <button
          type="button"
          onClick={enableSound}
          className="absolute end-4 top-6 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <Volume2 className="size-4" />
          {t("tapForSound")}
        </button>
      )}
    </div>
  );
}
