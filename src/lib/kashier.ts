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
      orderId: merchantOrderId,
      type: "one-time",
      merchantRedirect: redirectUrl,
      serverWebhook: webhookUrl,
      display: "en",
      // Every field below (down to `notes`) is included only to match
      // Kashier's documented example field-for-field, per their support
      // team's explicit request while diagnosing the WAF block on this
      // account — none of it is required by a working request.
      mode: "test",
      expireAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      maxFailureAttempts: 3,
      paymentType: "credit",
      allowedMethods: "card,wallet",
      redirectMethod: null,
      iframeBackgroundColor: "#FFFFFF",
      metaData: {
        customKey: "customValue",
        displayNotes: { key: "value" },
      },
      failureRedirect: false,
      brandColor: "#FF5733",
      defaultMethod: "card",
      manualCapture: false,
      saveCard: "optional",
      retrieveSavedCard: true,
      interactionSource: "ECOMMERCE",
      enable3DS: true,
      description: `Payment for order ${merchantOrderId}`,
      notes: "Special handling required",
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
