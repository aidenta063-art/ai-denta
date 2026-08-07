"use client";

import { useEffect } from "react";
import { trackMetaEvent, trackMetaCustomEvent } from "@/lib/meta-pixel";

/** Drop this into a page to fire a Meta Pixel event once on mount — e.g.
 * a confirmation page firing "Lead", or a funnel step firing "ViewContent"
 * with a `content_name`. Set `custom` for site-specific event names that
 * aren't part of Meta's standard event set. Never pass PII in `params`. */
export function TrackMetaEvent({
  event,
  params,
  custom,
}: {
  event: string;
  params?: Record<string, unknown>;
  custom?: boolean;
}) {
  useEffect(() => {
    if (custom) {
      trackMetaCustomEvent(event, params);
    } else {
      trackMetaEvent(event, params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per mount, not on every re-render
  }, []);

  return null;
}
