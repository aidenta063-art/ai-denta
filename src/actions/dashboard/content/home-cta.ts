"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveHomeCtaContent, CMS_TAGS } from "@/services/content/cms.service";
import { homeCtaFormSchema } from "@/lib/validation/cms.schema";

export type HomeCtaActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveHomeCtaAction(
  locale: Locale,
  _prevState: HomeCtaActionState,
  formData: FormData,
): Promise<HomeCtaActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = homeCtaFormSchema.safeParse({
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveHomeCtaContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.homeCta);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/home-cta`);
  return { success: true };
}
