import type {
  PaymentProvider,
  CreateSessionInput,
  CreateSessionResult,
  VerifyResult,
  WebhookInput,
  WebhookResult,
} from "@/services/payments/payment-provider.interface";

/**
 * No gateway is live yet. Payments are confirmed out-of-band by staff via
 * the dashboard's "Mark as Paid" action (added in a later phase), so this
 * provider never redirects anywhere or receives real webhooks — it just
 * marks the payment as pending and waits.
 */
export class ManualProvider implements PaymentProvider {
  async createSession(
    _input: CreateSessionInput,
  ): Promise<CreateSessionResult> {
    return { providerRefId: null, redirectUrl: null };
  }

  async verify(_providerRefId: string): Promise<VerifyResult> {
    return { status: "PENDING", amountCents: null };
  }

  async handleWebhook(_input: WebhookInput): Promise<WebhookResult> {
    throw new Error("ManualProvider does not receive webhooks");
  }
}
