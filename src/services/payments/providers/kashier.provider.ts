import {
  createKashierSession,
  getKashierSessionStatus,
  verifyKashierWebhookSignature,
} from "@/lib/kashier";
import type {
  PaymentProvider,
  CreateSessionInput,
  CreateSessionResult,
  VerifyResult,
  WebhookInput,
  WebhookResult,
} from "@/services/payments/payment-provider.interface";

const REFERENCE_PREFIX = {
  booking: "booking",
  ebook_order: "ebook",
} as const;

export function buildMerchantOrderId(
  referenceType: "booking" | "ebook_order",
  referenceId: string,
) {
  return `${REFERENCE_PREFIX[referenceType]}-${referenceId}`;
}

function parseMerchantOrderId(merchantOrderId: string): {
  referenceType: "booking" | "ebook_order";
  referenceId: string;
} | null {
  if (merchantOrderId.startsWith("booking-")) {
    return { referenceType: "booking", referenceId: merchantOrderId.slice(8) };
  }
  if (merchantOrderId.startsWith("ebook-")) {
    return { referenceType: "ebook_order", referenceId: merchantOrderId.slice(6) };
  }
  return null;
}

export function kashierWebhookUrl() {
  return `${process.env.APP_URL}/api/kashier/webhook`;
}

/** Card capture happens inside Kashier's own hosted iframe (Payment
 * Sessions v3) — raw card data never touches our server. See
 * src/lib/kashier.ts for the request/signature details. */
export class KashierProvider implements PaymentProvider {
  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const merchantOrderId = buildMerchantOrderId(
      input.referenceType,
      input.referenceId,
    );

    const session = await createKashierSession({
      merchantOrderId,
      amountCents: input.amountCents,
      currency: input.currency,
      redirectUrl: input.redirectUrl ?? "",
      webhookUrl: kashierWebhookUrl(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
    });

    return { providerRefId: session.sessionId, redirectUrl: session.sessionUrl };
  }

  /** Fallback for when Kashier's webhook is delayed or never arrives —
   * called from the redirect-back page so a real charge doesn't leave
   * the customer stuck on a "pending" screen. */
  async verify(providerRefId: string): Promise<VerifyResult> {
    return getKashierSessionStatus(providerRefId);
  }

  async handleWebhook({ rawBody, headers }: WebhookInput): Promise<WebhookResult> {
    const body = JSON.parse(rawBody) as {
      event: string;
      data: Record<string, unknown> & {
        merchantOrderId?: string;
        transactionId?: string;
        status?: string;
        amount?: string | number;
      };
    };

    const signatureHeader = headers.get("x-kashier-signature");
    const isValid = verifyKashierWebhookSignature({
      data: body.data,
      signatureHeader,
    });
    if (!isValid) {
      throw new Error("Invalid Kashier webhook signature");
    }

    const merchantOrderId = body.data.merchantOrderId;
    if (!merchantOrderId) {
      throw new Error("Kashier webhook missing merchantOrderId");
    }
    const parsed = parseMerchantOrderId(merchantOrderId);
    if (!parsed) {
      throw new Error(`Unrecognized Kashier merchantOrderId: ${merchantOrderId}`);
    }

    const status =
      body.data.status === "SUCCESS"
        ? "PAID"
        : body.data.status === "FAILED"
          ? "FAILED"
          : "PENDING";

    const amountCents = Math.round(Number(body.data.amount ?? 0) * 100);

    return {
      providerRefId: String(body.data.transactionId ?? merchantOrderId),
      referenceId: parsed.referenceId,
      referenceType: parsed.referenceType,
      status,
      amountCents,
      eventId: String(body.data.transactionId ?? merchantOrderId),
      payload: body,
    };
  }
}
