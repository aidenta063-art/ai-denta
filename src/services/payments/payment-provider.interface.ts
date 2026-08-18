export interface CreateSessionInput {
  /** The Payment or EbookOrder id this session is for — becomes the
   * gateway's merchantOrderId so the webhook can route back to it. */
  referenceId: string;
  referenceType: "booking" | "ebook_order";
  amountCents: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  /** Where the customer lands back on our site after paying. Gateway
   * providers require this; ManualProvider ignores it. */
  redirectUrl?: string;
}

export interface CreateSessionResult {
  providerRefId: string | null;
  redirectUrl: string | null;
}

export interface VerifyResult {
  status: "PENDING" | "PAID" | "FAILED";
}

export interface WebhookInput {
  rawBody: string;
  headers: Headers;
}

export interface WebhookResult {
  providerRefId: string;
  referenceId: string;
  referenceType: "booking" | "ebook_order";
  status: "PENDING" | "PAID" | "FAILED";
  eventId: string;
  payload: unknown;
}

/**
 * Port that any payment gateway (Kashier, etc.) implements later. The
 * schema already carries provider/providerRefId/providerPayload, so a
 * real gateway plugs in here without a migration.
 */
export interface PaymentProvider {
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>;
  verify(providerRefId: string): Promise<VerifyResult>;
  handleWebhook(input: WebhookInput): Promise<WebhookResult>;
}
