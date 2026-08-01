"use server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createEbookOrder } from "@/services/ebook/ebook.service";
import { ebookOrderSchema } from "@/lib/validation/ebook.schema";
import { checkActionRateLimit } from "@/lib/rate-limit";

export type EbookOrderState = {
  error?: "invalidInput" | "rateLimited";
};

export async function createEbookOrderAction(
  locale: Locale,
  _prevState: EbookOrderState,
  formData: FormData,
): Promise<EbookOrderState> {
  const { allowed } = await checkActionRateLimit("create-ebook-order", {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return { error: "rateLimited" };
  }

  const parsed = ebookOrderSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const session = await auth();
  const order = await createEbookOrder({
    ...parsed.data,
    userId: session?.user?.id,
  });

  redirect({
    href: `/ebook/order/${order.id}`,
    locale,
  });

  return {};
}
