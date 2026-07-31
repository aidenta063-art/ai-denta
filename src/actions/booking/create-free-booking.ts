"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createFreeBooking } from "@/services/booking/booking.service";
import { freeBookingSchema } from "@/lib/validation/booking.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";

export type FreeBookingState = {
  error?: "invalidInput" | "rateLimited";
};

export async function createFreeBookingAction(
  locale: Locale,
  _prevState: FreeBookingState,
  formData: FormData,
): Promise<FreeBookingState> {
  const { allowed } = await checkActionRateLimit("create-free-booking", {
    limit: 5,
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
  const { bookingId } = await createFreeBooking({
    ...parsed.data,
    userId: session?.user?.id,
  });

  redirect({
    href: `/booking/confirmation/${bookingId}`,
    locale,
  });

  return {};
}
