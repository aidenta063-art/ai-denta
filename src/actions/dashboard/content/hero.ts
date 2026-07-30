"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveHeroContent } from "@/services/content/cms.service";
import { heroFormSchema } from "@/lib/validation/cms.schema";

export type HeroActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveHeroAction(
  locale: Locale,
  _prevState: HeroActionState,
  formData: FormData,
): Promise<HeroActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = heroFormSchema.safeParse({
    eyebrowEn: formData.get("eyebrowEn"),
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    eyebrowAr: formData.get("eyebrowAr"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveHeroContent(parsed.data, session.user.id);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/hero`);
  return { success: true };
}
