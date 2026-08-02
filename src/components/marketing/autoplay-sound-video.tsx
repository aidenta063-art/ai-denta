"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Browsers block autoplay-with-sound outright (the play() promise
 * rejects, it doesn't just start muted) unless the site already has a
 * high media-engagement score with this visitor. So: try unmuted first;
 * if that's blocked, fall back to muted autoplay and surface a one-tap
 * "enable sound" button instead of making people hunt for the native
 * mute control.
 */
export function AutoplaySoundVideo({
  videoUrl,
  className,
}: {
  videoUrl: string;
  className?: string;
}) {
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
