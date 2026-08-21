"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  saveBookingPaidThankYouContent,
  CMS_TAGS,
} from "@/services/content/cms.service";
import { bookingPaidThankYouFormSchema } from "@/lib/validation/cms.schema";

export type BookingPaidThankYouActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveBookingPaidThankYouAction(
  locale: Locale,
  _prevState: BookingPaidThankYouActionState,
  formData: FormData,
): Promise<BookingPaidThankYouActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = bookingPaidThankYouFormSchema.safeParse({
    pendingTitleEn: formData.get("pendingTitleEn"),
    pendingDescriptionEn: formData.get("pendingDescriptionEn"),
    confirmedTitleEn: formData.get("confirmedTitleEn"),
    confirmedDescriptionEn: formData.get("confirmedDescriptionEn"),
    consultationLabelEn: formData.get("consultationLabelEn"),
    dateLabelEn: formData.get("dateLabelEn"),
    priceLabelEn: formData.get("priceLabelEn"),
    backHomeEn: formData.get("backHomeEn"),
    upsellBadgeEn: formData.get("upsellBadgeEn"),
    upsellTitleEn: formData.get("upsellTitleEn"),
    upsellDescriptionEn: formData.get("upsellDescriptionEn"),
    upsellBonusEn: formData.get("upsellBonusEn"),
    upsellCtaEn: formData.get("upsellCtaEn"),
    pendingTitleAr: formData.get("pendingTitleAr"),
    pendingDescriptionAr: formData.get("pendingDescriptionAr"),
    confirmedTitleAr: formData.get("confirmedTitleAr"),
    confirmedDescriptionAr: formData.get("confirmedDescriptionAr"),
    consultationLabelAr: formData.get("consultationLabelAr"),
    dateLabelAr: formData.get("dateLabelAr"),
    priceLabelAr: formData.get("priceLabelAr"),
    backHomeAr: formData.get("backHomeAr"),
    upsellBadgeAr: formData.get("upsellBadgeAr"),
    upsellTitleAr: formData.get("upsellTitleAr"),
    upsellDescriptionAr: formData.get("upsellDescriptionAr"),
    upsellBonusAr: formData.get("upsellBonusAr"),
    upsellCtaAr: formData.get("upsellCtaAr"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveBookingPaidThankYouContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.bookingPaidThankYou);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/booking-paid-thankyou`);
  return { success: true };
}
