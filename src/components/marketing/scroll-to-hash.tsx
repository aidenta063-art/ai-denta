"use client";

import { useEffect } from "react";

/**
 * The header menu links to in-page sections (e.g. "/#about") from other
 * pages too, relying on the browser's native navigate-then-scroll-to-hash
 * behavior. That races against this page's own client-render/hydration,
 * so the browser sometimes looks for the target element before it exists
 * and gives up, leaving the user at the top of the page instead of the
 * section. This retries on a rAF loop until the element shows up.
 */
export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let cancelled = false;
    let attempts = 0;

    function tryScroll() {
      if (cancelled) return;
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (attempts++ < 60) {
        requestAnimationFrame(tryScroll);
      }
    }

    tryScroll();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
