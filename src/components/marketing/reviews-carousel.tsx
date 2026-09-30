"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { StarRating } from "@/components/marketing/star-rating";

export type ReviewCardData = {
  id: string;
  name: string;
  rating: number;
  text: string;
  photoUrl: string | null;
};

/** A horizontally-scrollable row of review cards: fits 3 side by side on
 * desktop, and becomes a snap-scroll carousel once there are more than
 * that (rather than wrapping to new rows). */
export function ReviewsCarousel({ reviews }: { reviews: ReviewCardData[] }) {
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
  }, [reviews.length]);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-3"
      >
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            data-review-card
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
            <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7E00C9]/10">
              <div
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
                aria-hidden
              />
              <Quote className="size-7 fill-[#7E00C9]/10 text-[#7E00C9]/25" />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                {review.photoUrl ? (
                  <Image
                    src={review.photoUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-semibold text-primary">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-card-foreground">
                    {review.name}
                  </p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(canScrollPrev || canScrollNext) && (
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous reviews"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Next reviews"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
