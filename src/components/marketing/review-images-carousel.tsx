"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export type ReviewImageData = { id: string; url: string };

/** A horizontally-scrollable row of result screenshots: fits 3 side by
 * side on desktop, and becomes a snap-scroll carousel once there are
 * more than that (rather than wrapping to new rows). Scrolling is
 * entirely visitor-driven (drag/swipe or the arrow buttons) — the only
 * automatic behavior is that the arrows wrap around at either end
 * instead of stopping dead. */
export function ReviewImagesCarousel({ images }: { images: ReviewImageData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function updateScrollState() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [images.length]);

  function goPrev() {
    const el = trackRef.current;
    if (!el) return;
    if (!canScrollPrev) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      return;
    }
    const card = el.querySelector<HTMLElement>("[data-review-image]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: -amount, behavior: "smooth" });
  }

  function goNext() {
    const el = trackRef.current;
    if (!el) return;
    if (!canScrollNext) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const card = el.querySelector<HTMLElement>("[data-review-image]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            data-review-image
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: Math.min(i, 3) * 0.08,
              ease: "easeOut",
            }}
            whileHover={{ y: -6 }}
            className="w-[min(82vw,320px)] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] sm:min-w-[260px]"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7E00C9]/10">
              <div
                className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
                aria-hidden
              />
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 82vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous results"
            className="absolute top-1/2 start-0 z-20 hidden size-9 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary rtl:translate-x-1/2 sm:flex"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next results"
            className="absolute top-1/2 end-0 z-20 hidden size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary rtl:-translate-x-1/2 sm:flex"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
