import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Fixed-window limiter backed by Postgres (RateLimitBucket). Vercel runs
 * each request on one of several independent serverless instances, so an
 * in-memory counter doesn't see traffic that lands on a different
 * instance — a shared store is required for the limit to mean anything.
 * This reuses the app's existing Postgres/Prisma connection rather than
 * adding a new service (e.g. Redis/Upstash).
 *
 * The upsert is a single atomic statement: concurrent callers racing on
 * the same key still serialize correctly through Postgres's row lock,
 * so the count can't be under-reported the way a read-then-write would.
 */
export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" AS b (key, count, "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN b."resetAt" < ${now} THEN 1 ELSE b.count + 1 END,
      "resetAt" = CASE WHEN b."resetAt" < ${now} THEN ${resetAt} ELSE b."resetAt" END
    RETURNING count
  `;

  const count = rows[0].count;
  if (count > limit) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - count };
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
