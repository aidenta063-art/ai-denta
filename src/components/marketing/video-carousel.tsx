"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD = 40;

type VideoItem = { id: string; url: string };

/**
 * Infinite-loop carousel built with cloned edge slides: the track is
 * [last, ...videos, first], starting at index 1 (the real first video).
 * Advancing past a clone snaps instantly (no transition) back to the
 * matching real slide, so the loop never visually "rewinds".
 */
export function VideoCarousel({ videos }: { videos: VideoItem[] }) {
  const count = videos.length;
  const loop = count > 1;
  const slides = loop ? [videos[count - 1], ...videos, videos[0]] : videos;

  const [index, setIndex] = useState(loop ? 1 : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const startX = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  // Shared across every VideoSlide instance so the loop's first/last clones
  // (which reference the same URL as a real slide) don't each independently
  // re-fetch the whole file — see VideoSlide's preload effect.
  const loadedUrlsRef = useRef<Set<string>>(new Set());

  // This section sits below the fold; don't start pulling multi-MB video
  // files over the network until the carousel is actually about to be
  // seen, or they'd compete with the rest of the page's initial load.
  const containerRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((next: number) => {
    setWithTransition(true);
    setIndex(next);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!loop || lightboxOpen || hovering) return;
    const timer = setInterval(() => setIndex((i) => i + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [loop, lightboxOpen, hovering]);

  function handleAnimationComplete() {
    if (!loop) return;
    if (index === slides.length - 1) {
      setWithTransition(false);
      setIndex(1);
    } else if (index === 0) {
      setWithTransition(false);
      setIndex(slides.length - 2);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    if (!loop) return;
    if (delta < -SWIPE_THRESHOLD) {
      suppressClickRef.current = true;
      next();
    } else if (delta > SWIPE_THRESHOLD) {
      suppressClickRef.current = true;
      prev();
    }
  }

  // A swipe that just changed slides shouldn't also register as a tap
  // that opens the lightbox.
  function onClickCapture(e: React.MouseEvent) {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  }

  if (count === 0) return null;

  const activeRealIndex = loop ? (index - 1 + count) % count : index;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-xs sm:max-w-sm"
      dir="ltr"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="touch-pan-y overflow-hidden rounded-2xl"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${index * 100}%` }}
          transition={
            withTransition
              ? { type: "spring", stiffness: 300, damping: 32 }
              : { duration: 0 }
          }
          onAnimationComplete={handleAnimationComplete}
        >
          {slides.map((video, i) => (
            <div key={`${video.id}-${i}`} className="aspect-[9/16] w-full shrink-0">
              <VideoSlide
                video={video}
                isActive={i === index}
                nearViewport={nearViewport}
                shouldPreload={nearViewport && Math.abs(i - index) <= 1}
                loadedUrlsRef={loadedUrlsRef}
                onOpenChange={setLightboxOpen}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {loop && (
        <>
          <button
            type="button"
            aria-label="Previous video"
            onClick={prev}
            className="absolute start-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next video"
            onClick={next}
            className="absolute end-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-4 flex justify-center gap-1.5">
            {videos.map((video, i) => (
              <button
                key={video.id}
                type="button"
                aria-label={`Go to video ${i + 1}`}
                onClick={() => goTo(i + 1)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeRealIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function VideoSlide({
  video,
  isActive,
  nearViewport,
  shouldPreload,
  loadedUrlsRef,
  onOpenChange,
}: {
  video: VideoItem;
  isActive: boolean;
  nearViewport: boolean;
  shouldPreload: boolean;
  loadedUrlsRef: React.RefObject<Set<string>>;
  onOpenChange: (open: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // The `preload` attribute is only a hint the browser consults once, the
  // first time it runs resource selection for the element — flipping it
  // from "none" to "auto" later (as this slide enters the carousel's
  // preload window) does nothing on its own. Calling load() explicitly
  // re-runs resource selection against the *current* preload value, so
  // this is what actually starts buffering ahead of time.
  //
  // The loop's first/last slides are cloned (see slides above) so the
  // same video URL can back two separate <video> elements at once —
  // without the shared loadedUrlsRef guard, each clone would trigger its
  // own full fetch of the same file.
  useEffect(() => {
    const el = videoRef.current;
    if (
      !el ||
      !shouldPreload ||
      loadedUrlsRef.current.has(video.url) ||
      // NETWORK_EMPTY (0): resource selection hasn't run for this element
      // yet. Anything past that means it's already loading/loaded, so
      // calling load() again would only abort and restart the fetch.
      el.networkState !== HTMLMediaElement.NETWORK_EMPTY
    ) {
      return;
    }
    loadedUrlsRef.current.add(video.url);
    el.load();
  }, [shouldPreload, video.url, loadedUrlsRef]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive && nearViewport) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, nearViewport]);

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger className="group relative block size-full cursor-pointer overflow-hidden border-0 bg-black p-0 text-start">
        <video
          ref={videoRef}
          src={video.url}
          className="size-full object-cover"
          muted
          loop
          playsInline
          preload={shouldPreload ? "auto" : "none"}
        />
      </DialogTrigger>
      <DialogContent className="max-w-sm border-none bg-black p-0 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
        <video
          src={video.url}
          className="aspect-[9/16] w-full rounded-2xl"
          controls
          autoPlay
          playsInline
        />
      </DialogContent>
    </Dialog>
  );
}
