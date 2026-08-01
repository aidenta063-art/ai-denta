"use client";

import { motion, type Variants } from "framer-motion";
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
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50">
              <div
                className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
                aria-hidden
              />
              <video
                src={videoUrl}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="aspect-video w-full"
              />
            </div>
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
