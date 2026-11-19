"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Browsers block autoplay-with-sound outright (the play() promise
 * rejects, it doesn't just start muted) unless the site already has a
 * high media-engagement score with this visitor. So: try unmuted first;
 * if that's blocked, fall back to muted autoplay and surface a one-tap
 * "enable sound" button instead of making people hunt for the native
 * mute control.
 *
 * `autoplay={false}` skips all of that and just waits for a tap — used
 * for sections where playback shouldn't start on its own.
 */
export function AutoplaySoundVideo({
  videoUrl,
  className,
  autoplay = true,
}: {
  videoUrl: string;
  className?: string;
  autoplay?: boolean;
}) {
  const t = useTranslations("HomePage");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!autoplay) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.play().catch(() => {
      el.muted = true;
      setNeedsUnmute(true);
      el.play().catch(() => {});
    });
  }, [autoplay]);

  function enableSound() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    setNeedsUnmute(false);
    el.play().catch(() => {});
  }

  function startPlayback() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.play().catch(() => {});
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50",
        className,
      )}
    >
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
        aria-hidden
      />
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay={autoplay}
        loop
        playsInline
        preload={autoplay ? "auto" : "metadata"}
        onPlay={() => setHasStarted(true)}
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
      {!autoplay && !hasStarted && (
        <button
          type="button"
          onClick={startPlayback}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-[#251037] shadow-xl transition-transform hover:scale-105">
            <Play className="size-7 translate-x-0.5" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
