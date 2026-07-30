export interface CreateSessionInput {
  bookingId: string;
  amountCents: number;
  currency: string;
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
  status: "PENDING" | "PAID" | "FAILED";
  eventId: string;
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
