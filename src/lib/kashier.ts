import crypto from "node:crypto";
import { logger } from "@/lib/logger";

const KASHIER_API_BASE = "https://api.kashier.io";

export class KashierError extends Error {}

/** Kashier's secret key contains a literal "$", and Vercel's own env var
 * injection (not @next/env, not our shell — confirmed by testing all
 * three independently) treats "$word" inside a stored value as a
 * variable reference and silently truncates it, regardless of escaping.
 * Storing the key split across two vars with no "$" in either one, then
 * rejoining it here, sidesteps that entirely. */
function getKashierSecretKey(): string | undefined {
  const part1 = process.env.KASHIER_SECRET_KEY_PART1;
  const part2 = process.env.KASHIER_SECRET_KEY_PART2;
  if (!part1 || !part2) return undefined;
  return `${part1}$${part2}`;
}

/** Creates a Kashier Payment Session (v3) and returns the iframe URL to
 * embed. Card capture happens entirely inside that iframe on Kashier's own
 * origin — raw card data never reaches our server, keeping PCI scope low. */
export async function createKashierSession({
  merchantOrderId,
  amountCents,
  currency,
  redirectUrl,
  webhookUrl,
  customerName,
  customerEmail,
}: {
  merchantOrderId: string;
  amountCents: number;
  currency: string;
  redirectUrl: string;
  webhookUrl: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<{ sessionId: string; sessionUrl: string }> {
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const apiKey = process.env.KASHIER_API_KEY;
  const secretKey = getKashierSecretKey();
  if (!merchantId || !apiKey || !secretKey) {
    throw new KashierError("Kashier credentials are not configured");
  }

  const response = await fetch(`${KASHIER_API_BASE}/v3/payment/sessions`, {
    method: "POST",
    headers: {
      Authorization: secretKey,
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantId,
      amount: (amountCents / 100).toFixed(2),
      currency,
      order: merchantOrderId,
      type: "one-time",
      merchantRedirect: redirectUrl,
      serverWebhook: webhookUrl,
      display: "en",
      // Kashier requires a customer object with a reference even for
      // guest checkout — the order id is a stable, unique stand-in when
      // we don't have a real customer identity to reference.
      customer: {
        reference: merchantOrderId,
        ...(customerName && { name: customerName }),
        ...(customerEmail && { email: customerEmail }),
      },
    }),
  });

  const rawBody = await response.text();
  const data = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();

  if (!response.ok || !data?.sessionUrl) {
    // Logged before throwing so the raw response — including a non-JSON
    // body like a WAF/security-page block — is always visible in server
    // logs, not just "data: null" when JSON parsing fails.
    logger.error(
      {
        status: response.status,
        contentType: response.headers.get("content-type"),
        rawBody: rawBody.slice(0, 2000),
        data,
      },
      "Failed to create Kashier payment session",
    );
    throw new KashierError(
      data?.message ?? `Kashier session creation failed (${response.status})`,
    );
  }

  return { sessionId: data._id, sessionUrl: data.sessionUrl };
}

/** Actively checks a session's real status with Kashier, instead of only
 * waiting on their webhook — webhooks can be delayed or lost (this is
 * what surfaced the need: a real charge succeeded but no webhook ever
 * arrived), so the redirect-back page uses this as a fallback check. */
export async function getKashierSessionStatus(sessionId: string): Promise<{
  status: "PENDING" | "PAID" | "FAILED";
  amountCents: number | null;
}> {
  const secretKey = getKashierSecretKey();
  if (!secretKey) {
    throw new KashierError("Kashier credentials are not configured");
  }

  const response = await fetch(
    `${KASHIER_API_BASE}/v3/payment/sessions/${sessionId}/payment`,
    {
      method: "GET",
      headers: { Authorization: secretKey },
    },
  );

  const rawBody = await response.text();
  const data = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();

  if (!response.ok || !data) {
    logger.error(
      { status: response.status, rawBody: rawBody.slice(0, 2000) },
      "Failed to fetch Kashier session status",
    );
    return { status: "PENDING", amountCents: null };
  }

  // This endpoint reports "PAID"/"FAILED" directly (unlike the webhook
  // payload, which uses "SUCCESS"/"FAILED") — confirmed against a real
  // completed payment, where this returned {"status":"PAID",...}.
  const rawStatus: unknown = data.status ?? data.data?.status;
  const status =
    rawStatus === "PAID" || rawStatus === "SUCCESS"
      ? "PAID"
      : rawStatus === "FAILED"
        ? "FAILED"
        : "PENDING";

  const rawAmount: unknown = data.amount ?? data.data?.amount;
  const amountCents =
    rawAmount != null ? Math.round(Number(rawAmount) * 100) : null;

  return { status, amountCents };
}

/** Verifies an inbound webhook's `x-kashier-signature` header: sort the
 * event's own `data.signatureKeys` alphabetically, build a `key=value&...`
 * query string from those fields, and HMAC-SHA256 it with the Payment API
 * key (not the secret key — this is what Kashier's docs specify). */
export function verifyKashierWebhookSignature({
  data,
  signatureHeader,
}: {
  data: Record<string, unknown>;
  signatureHeader: string | null;
}): boolean {
  const apiKey = process.env.KASHIER_API_KEY;
  if (!apiKey || !signatureHeader) return false;

  const signatureKeys = data.signatureKeys;
  if (!Array.isArray(signatureKeys) || signatureKeys.length === 0) {
    return false;
  }

  const sortedKeys = [...signatureKeys].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
  const queryString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(queryString)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader),
    );
  } catch {
    return false;
  }
}
