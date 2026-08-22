"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  updateEbookPricing,
  EBOOK_PRICE_CACHE_TAG,
} from "@/services/ebook/ebook.service";
import { ebookPriceFormSchema } from "@/lib/validation/cms.schema";

export type EbookPriceActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveEbookPriceAction(
  locale: Locale,
  _prevState: EbookPriceActionState,
  formData: FormData,
): Promise<EbookPriceActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = ebookPriceFormSchema.safeParse({
    priceEgp: formData.get("priceEgp"),
    discountEnabled: formData.get("discountEnabled") === "on",
    discountType: formData.get("discountType") || "PERCENTAGE",
    discountValue: formData.get("discountValue") || 0,
  });
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateEbookPricing(parsed.data);
  updateTag(EBOOK_PRICE_CACHE_TAG);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/ebook-pricing`);
  return { success: true };
}
