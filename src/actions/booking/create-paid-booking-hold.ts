"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createPaidBookingHold } from "@/services/booking/booking.service";
import { buildIntakeSchema } from "@/lib/validation/intake.schema";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";
import { checkActionRateLimit } from "@/lib/rate-limit";
import type { IntakeFormState } from "@/components/booking/intake-form";

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

  const steps = await getIntakeFormSteps();
  const parsed = buildIntakeSchema(steps).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const session = await auth();
  const result = await createPaidBookingHold({
    ...parsed.data,
    slotId,
    userId: session?.user?.id,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  redirect({
    href: `/booking/paid/pending/${result.bookingId}`,
    locale,
  });

  return {};
}
