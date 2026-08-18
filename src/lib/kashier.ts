import crypto from "node:crypto";
import { logger } from "@/lib/logger";

const KASHIER_API_BASE = "https://api.kashier.io";

export class KashierError extends Error {}

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
  const secretKey = process.env.KASHIER_SECRET_KEY;
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

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.sessionUrl) {
    logger.error(
      { status: response.status, data },
      "Failed to create Kashier payment session",
    );
    throw new KashierError(
      data?.message ?? `Kashier session creation failed (${response.status})`,
    );
  }

  return { sessionId: data._id, sessionUrl: data.sessionUrl };
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
