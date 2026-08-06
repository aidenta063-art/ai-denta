"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createFreeBooking } from "@/services/booking/booking.service";
import { buildIntakeSchema } from "@/lib/validation/intake.schema";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";
import { ConsultationKind } from "@/generated/prisma/enums";
import { checkActionRateLimit } from "@/lib/rate-limit";
import type { IntakeFormState } from "@/components/booking/intake-form";

export type FreeBookingState = IntakeFormState;

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

  const steps = await getIntakeFormSteps(ConsultationKind.FREE);
  const parsed = buildIntakeSchema(steps).safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  // The intro/gate page is public now (see proxy.ts), so this is the
  // actual enforcement point for "must be logged in to book" — not just
  // a client-side nicety.
  const session = await auth();
  if (!session?.user) {
    redirect({
      href: { pathname: "/login", query: { next: `/${locale}/booking/free` } },
      locale,
    });
    return {};
  }

  const result = await createFreeBooking({
    ...parsed.data,
    userId: session.user.id,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  redirect({
    href: `/booking/confirmation/${result.bookingId}`,
    locale,
  });

  return {};
}
