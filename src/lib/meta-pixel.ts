declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fires a Meta Pixel standard event. No-ops when the pixel isn't loaded
 * (not configured, or blocked by the browser) — safe to call unconditionally
 * from anywhere in the client tree. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, params);
}
