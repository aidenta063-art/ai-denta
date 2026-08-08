"use client";

import { motion, type Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AutoplaySoundVideo } from "@/components/marketing/autoplay-sound-video";
import { ScheduleGridBackdrop } from "@/components/marketing/schedule-grid-backdrop";
import { Eyebrow } from "@/components/marketing/eyebrow";
import type { Locale } from "@/i18n/routing";
import { trackMetaCustomEvent } from "@/lib/meta-pixel";

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
      <ScheduleGridBackdrop className="pointer-events-none absolute -top-4 -left-6 hidden opacity-70 sm:grid" />
      <ScheduleGridBackdrop className="pointer-events-none absolute -right-6 bottom-0 hidden opacity-50 sm:grid" />

      <motion.div
        variants={container}
        initial={false}
        animate="show"
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28"
      >
        <motion.div variants={item}>
          <Eyebrow tone="dark">
            <span className="motion-safe:animate-slot-pulse size-1.5 rounded-full bg-[#B98AE8]" />
            {eyebrow}
          </Eyebrow>
        </motion.div>

        {videoUrl && (
          <motion.div variants={item} className="w-full">
            <AutoplaySoundVideo
              videoUrl={videoUrl}
              className="mx-auto max-w-4xl"
            />
          </motion.div>
        )}

        <motion.h1
          variants={item}
          className="max-w-3xl text-5xl leading-[1.05] font-black tracking-tight text-white sm:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-2xl text-lg text-[#EDE3F5]/80 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Button
            size="lg"
            className="bg-white text-base text-[#251037] shadow-xl shadow-black/20 hover:bg-white/90"
            render={
              <Link
                href="/booking/paid"
                locale={locale}
                onClick={() =>
                  trackMetaCustomEvent("CTAClick", { cta: "hero_paid" })
                }
              />
            }
          >
            {ctaPaid}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            render={
              <Link
                href="/booking/free"
                locale={locale}
                onClick={() =>
                  trackMetaCustomEvent("CTAClick", { cta: "hero_free" })
                }
              />
            }
          >
            {ctaFree}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
