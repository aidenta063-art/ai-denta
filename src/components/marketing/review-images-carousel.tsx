"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export type ReviewImageData = { id: string; url: string };

const VISIBLE_DESKTOP_CARDS = 3;

/** A horizontally-scrollable row of result screenshots: fits 3 side by
 * side on desktop. Once there are more than that, scrolling (drag/swipe
 * or the arrow buttons) loops endlessly — reaching the last image while
 * still scrolling continues straight into the first one again, with no
 * dead stop and no separate "jump back" moment. */
export function ReviewImagesCarousel({ images }: { images: ReviewImageData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const loop = images.length > VISIBLE_DESKTOP_CARDS;
  // When looping, render the set twice back to back. Scrolling past the
  // end of the first (real) copy just carries on into the second
  // (cloned) one, which is pixel-identical — see the rewind effect below.
  const trackImages = loop
    ? [...images, ...images.map((img) => ({ ...img, id: `${img.id}-clone` }))]
    : images;

  useEffect(() => {
    if (!loop) return;
    const el = trackRef.current;
    if (!el) return;

    // As the scroll position crosses into the cloned half, silently
    // rewind by exactly one set's width. Since the clone matches the
    // original pixel for pixel, the jump is invisible — the motion just
    // reads as an endless loop instead of a stop-then-snap-back.
    function handleScroll() {
      const track = trackRef.current;
      if (!track) return;
      const singleSetWidth = track.scrollWidth / 2;
      if (singleSetWidth <= 0) return;
      // A burst of coalesced scroll/wheel events can advance scrollLeft
      // by more than one full lap before this handler gets to run —
      // loop rather than subtracting once, so it still lands in range.
      while (track.scrollLeft >= singleSetWidth) {
        track.scrollLeft -= singleSetWidth;
      }
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loop, images.length]);

  function cardStep(el: HTMLDivElement) {
    const card = el.querySelector<HTMLElement>("[data-review-image]");
    return (card?.offsetWidth ?? 320) + 24;
  }

  function goPrev() {
    const el = trackRef.current;
    if (!el) return;
    const amount = cardStep(el);
    if (el.scrollLeft < amount) {
      // Near the very start — hop to the matching spot in the trailing
      // clone first, so scrolling back still feels continuous.
      el.scrollLeft += el.scrollWidth / 2;
    }
    el.scrollBy({ left: -amount, behavior: "smooth" });
  }

  function goNext() {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: cardStep(el), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {trackImages.map((image, i) => (
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7E00C9]/10">
              <div
                className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
                aria-hidden
              />
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 82vw"
                className="object-contain p-2"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {loop && (
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
