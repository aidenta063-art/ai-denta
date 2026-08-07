declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fires a Meta Pixel standard event (PageView, Lead, Schedule,
 * InitiateCheckout, AddPaymentInfo, Purchase, CompleteRegistration, ...).
 * No-ops when the pixel isn't loaded (not configured, or blocked by the
 * browser) — safe to call unconditionally from anywhere in the client
 * tree. Never pass PII (names, emails, phone numbers, answers, payment
 * details) in params — only categorical/structural values. */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, params);
}

/** Same as trackMetaEvent but for site-specific events that aren't part
 * of Meta's standard event set (e.g. "ScrollDepth", "BookingStepCompleted")
 * — fbq's `trackCustom` keeps these classified as Custom Events in Events
 * Manager instead of being matched against standard event definitions. */
export function trackMetaCustomEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", event, params);
}
