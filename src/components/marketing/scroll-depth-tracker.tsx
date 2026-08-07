"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaCustomEvent } from "@/lib/meta-pixel";

const THRESHOLDS = [25, 50, 75, 90, 100];

/** Fires a "ScrollDepth" custom event the first time the page is scrolled
 * past each threshold in THRESHOLDS. Mounted once, site-wide — resets its
 * fired-thresholds set on every route change so each page view is tracked
 * independently. Uses a passive, rAF-throttled scroll listener so it can't
 * add jank to scrolling. */
export function ScrollDepthTracker() {
  const pathname = usePathname();
  const firedRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  useEffect(() => {
    firedRef.current = new Set();
  }, [pathname]);

  useEffect(() => {
    function checkDepth() {
      tickingRef.current = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;

      for (const threshold of THRESHOLDS) {
        if (percent >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          trackMetaCustomEvent("ScrollDepth", {
            percent: threshold,
            path: pathname,
          });
        }
      }
    }

    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(checkDepth);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
