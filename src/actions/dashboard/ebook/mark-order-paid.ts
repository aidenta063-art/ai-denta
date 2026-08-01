"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { markEbookOrderAsPaid } from "@/services/ebook/ebook.service";
import { logger } from "@/lib/logger";

export async function markEbookOrderPaidAction(
  locale: Locale,
  orderId: string,
) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await markEbookOrderAsPaid(orderId, session.user.id);
  logger.info(
    { orderId, markedByUserId: session.user.id },
    "Ebook order manually marked as paid",
  );
  revalidatePath(`/${locale}/dashboard/ebook-orders`);
}
