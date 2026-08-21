"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createPaidBookingHold } from "@/services/booking/booking.service";
import { buildIntakeSchema } from "@/lib/validation/intake.schema";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";
import { ConsultationKind, PaymentProviderName } from "@/generated/prisma/enums";
import { checkActionRateLimit } from "@/lib/rate-limit";
import type { IntakeFormState } from "@/components/booking/intake-form";
import { prisma } from "@/lib/prisma";
import { confirmBookingPaymentFromGateway } from "@/services/payments/payments-admin.service";

export type PaidBookingHoldState = IntakeFormState;

export async function createPaidBookingHoldAction(
  locale: Locale,
  slotId: string,
  _prevState: PaidBookingHoldState,
  formData: FormData,
): Promise<PaidBookingHoldState> {
  const { allowed } = await checkActionRateLimit("create-paid-booking-hold", {
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const steps = await getIntakeFormSteps(ConsultationKind.PAID);
  const parsed = buildIntakeSchema(steps).safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  // The slot picker and intake form are public now (see proxy.ts), so
  // this is the actual enforcement point for "must be logged in to
  // book" — not just a client-side nicety.
  const session = await auth();
  if (!session?.user) {
    redirect({
      href: {
        pathname: "/login",
        query: { next: `/${locale}/booking/paid/${slotId}` },
      },
      locale,
    });
    return {};
  }

  const result = await createPaidBookingHold({
    ...parsed.data,
    slotId,
    userId: session.user.id,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  // A 100%-discounted (or admin-priced-at-zero) paid consultation has
  // nothing to actually charge — confirm it immediately instead of
  // sending the customer through a card/Instapay/Vodafone Cash flow for
  // EGP 0. Only ever fires when the computed final price is exactly
  // zero; any real amount still goes through the normal payment step.
  const payment = await prisma.payment.findUnique({
    where: { bookingId: result.bookingId },
  });
  if (payment && payment.amountCents === 0) {
    await confirmBookingPaymentFromGateway({
      paymentId: payment.id,
      provider: PaymentProviderName.MANUAL,
      providerRefId: `zero-price-${payment.id}`,
      providerPayload: { source: "zero-price-auto-confirm" },
      amountCents: 0,
    });
  }

  redirect({
    href: `/booking/paid/pending/${result.bookingId}`,
    locale,
  });

  return {};
}
