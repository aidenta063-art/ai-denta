"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createPaidBookingHold } from "@/services/booking/booking.service";
import { freeBookingSchema } from "@/lib/validation/booking.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";

export type PaidBookingHoldState = {
  error?: "invalidInput" | "slotNoLongerAvailable" | "rateLimited";
};

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

  const parsed = freeBookingSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

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
