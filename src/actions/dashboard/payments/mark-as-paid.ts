"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { markPaymentAsPaid } from "@/services/payments/payments-admin.service";
import { logger } from "@/lib/logger";

export async function markAsPaidAction(locale: Locale, paymentId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await markPaymentAsPaid(paymentId, session.user.id);
  logger.info(
    { paymentId, markedByUserId: session.user.id },
    "Payment manually marked as paid",
  );
  revalidatePath(`/${locale}/dashboard/payments`);
}
