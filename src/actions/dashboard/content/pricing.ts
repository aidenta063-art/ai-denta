"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role, ConsultationKind } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { updateConsultationTypePricing } from "@/services/content/cms.service";
import { pricingFormSchema } from "@/lib/validation/cms.schema";

export type PricingActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function savePricingAction(
  locale: Locale,
  kind: ConsultationKind,
  _prevState: PricingActionState,
  formData: FormData,
): Promise<PricingActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = pricingFormSchema.safeParse({
    nameEn: formData.get("nameEn"),
    nameAr: formData.get("nameAr"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionAr: formData.get("descriptionAr"),
    priceEgp: formData.get("priceEgp"),
    durationMinutes: formData.get("durationMinutes"),
    discountEnabled: formData.get("discountEnabled") === "on",
    discountType: formData.get("discountType") || "PERCENTAGE",
    discountValue: formData.get("discountValue") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateConsultationTypePricing(kind, parsed.data);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/pricing`);
  return { success: true };
}
