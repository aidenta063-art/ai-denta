"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export type TeamMemberCardData = {
  id: string;
  name: string;
  position: string | null;
  photoUrl: string | null;
};

/** A horizontally-scrollable row of team member cards, same pattern as
 * ReviewImagesCarousel: scrolling is entirely visitor-driven (drag/swipe
 * or the arrow buttons), the only automatic behavior is the arrows
 * wrapping around at either end instead of stopping dead. */
export function TeamMembersCarousel({
  members,
}: {
  members: TeamMemberCardData[];
}) {
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
  }, [members.length]);

  function goPrev() {
    const el = trackRef.current;
    if (!el) return;
    if (!canScrollPrev) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      return;
    }
    const card = el.querySelector<HTMLElement>("[data-team-member]");
    const amount = (card?.offsetWidth ?? 220) + 32;
    el.scrollBy({ left: -amount, behavior: "smooth" });
  }

  function goNext() {
    const el = trackRef.current;
    if (!el) return;
    if (!canScrollNext) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const card = el.querySelector<HTMLElement>("[data-team-member]");
    const amount = (card?.offsetWidth ?? 220) + 32;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="-mx-6 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-6 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            data-team-member
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: Math.min(i, 3) * 0.08,
              ease: "easeOut",
            }}
            className="flex w-44 shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-52"
          >
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt=""
                width={220}
                height={220}
                className="size-36 rounded-full border border-border object-cover sm:size-44"
              />
            ) : (
              <div className="flex size-36 items-center justify-center rounded-full border border-border bg-muted text-3xl font-semibold text-muted-foreground sm:size-44">
                {member.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-card-foreground">{member.name}</p>
              {member.position && (
                <p className="text-sm text-muted-foreground">{member.position}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous team member"
            className="absolute top-1/2 start-0 z-20 hidden size-9 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary rtl:translate-x-1/2 sm:flex"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next team member"
            className="absolute top-1/2 end-0 z-20 hidden size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary rtl:-translate-x-1/2 sm:flex"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
