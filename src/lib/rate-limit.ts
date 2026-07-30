import { headers } from "next/headers";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window limiter. Fine for a single Node process (this
 * project's current deployment target); move to a shared store (Redis/
 * Upstash) before running multiple instances, since counts here don't
 * cross processes.
 */
const buckets = new Map<string, Bucket>();

// Periodic sweep so the map doesn't grow unbounded across a long-running process.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  },
  10 * 60_000,
).unref?.();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count };
}

/**
 * Best-effort client identifier for Server Actions (no direct Request
 * object available there). Behind a real reverse proxy in production,
 * x-forwarded-for is set correctly; in local dev without one, every
 * caller collapses to a single "local" bucket — acceptable for dev, but
 * worth knowing before reading too much into rate-limit test results
 * locally.
 */
export async function getClientKey(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "local";
}

export async function checkActionRateLimit(
  action: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const client = await getClientKey();
  return checkRateLimit(`${action}:${client}`, options);
}
