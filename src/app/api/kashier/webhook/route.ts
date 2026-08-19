import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { KashierProvider } from "@/services/payments/providers/kashier.provider";
import { PaymentProviderName } from "@/generated/prisma/enums";
import {
  confirmBookingPaymentFromGateway,
  markBookingPaymentFailedFromGateway,
} from "@/services/payments/payments-admin.service";
import { confirmEbookOrderFromGateway } from "@/services/ebook/ebook.service";

const kashierProvider = new KashierProvider();

/** Kashier POSTs here on every payment event (success, failure, etc.) for
 * both paid-consultation bookings and ebook orders — see
 * buildMerchantOrderId in kashier.provider.ts for how a single webhook
 * routes to either. Always answers 200 once the signature is verified,
 * even for events we don't act on, so Kashier doesn't keep retrying. */
export async function POST(request: Request) {
  const rawBody = await request.text();

  let result;
  try {
    result = await kashierProvider.handleWebhook({
      rawBody,
      headers: request.headers,
    });
  } catch (error) {
    logger.error({ err: error }, "Kashier webhook rejected");
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (result.status === "PAID") {
    try {
      if (result.referenceType === "booking") {
        await confirmBookingPaymentFromGateway({
          paymentId: result.referenceId,
          provider: PaymentProviderName.KASHIER,
          providerRefId: result.providerRefId,
          providerPayload: result.payload,
          amountCents: result.amountCents,
        });
      } else {
        await confirmEbookOrderFromGateway({
          orderId: result.referenceId,
          provider: PaymentProviderName.KASHIER,
          providerRefId: result.providerRefId,
          providerPayload: result.payload,
          amountCents: result.amountCents,
        });
      }
    } catch (error) {
      logger.error(
        { err: error, referenceType: result.referenceType, referenceId: result.referenceId },
        "Failed to confirm payment from Kashier webhook",
      );
      // Still 200 — Kashier's own retry cadence won't help with a bug on
      // our side, and we don't want it hammering us for 24h over one.
    }
  } else if (result.status === "FAILED" && result.referenceType === "booking") {
    try {
      await markBookingPaymentFailedFromGateway(result.referenceId);
    } catch (error) {
      logger.error(
        { err: error, referenceId: result.referenceId },
        "Failed to mark booking payment as failed from Kashier webhook",
      );
    }
  } else {
    logger.info(
      { referenceType: result.referenceType, referenceId: result.referenceId, status: result.status },
      "Kashier webhook received (non-success status)",
    );
  }

  return NextResponse.json({ received: true });
}
