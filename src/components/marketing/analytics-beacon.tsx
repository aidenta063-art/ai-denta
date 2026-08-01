"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/routing";

/** Fires a same-origin beacon on every route change so the admin Reports
 * page can chart traffic. No script runs unless this mounts, and it never
 * touches third-party trackers — see meta-pixel.tsx for that. */
export function AnalyticsBeacon({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, locale]);

  return null;
}
