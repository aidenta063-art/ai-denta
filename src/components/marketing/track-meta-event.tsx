"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

/** Drop this into a page that only renders after a conversion (e.g. a
 * confirmation page) to fire a Meta Pixel standard event once on mount. */
export function TrackMetaEvent({ event }: { event: string }) {
  useEffect(() => {
    trackMetaEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per mount, not on every re-render
  }, []);

  return null;
}
