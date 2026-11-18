"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveWhyUsContent, CMS_TAGS } from "@/services/content/cms.service";
import { whyUsFormSchema } from "@/lib/validation/cms.schema";

export type WhyUsActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveWhyUsAction(
  locale: Locale,
  _prevState: WhyUsActionState,
  formData: FormData,
): Promise<WhyUsActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = whyUsFormSchema.safeParse({
    eyebrowEn: formData.get("eyebrowEn"),
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    eyebrowAr: formData.get("eyebrowAr"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
    item1TitleEn: formData.get("item1TitleEn"),
    item1DescriptionEn: formData.get("item1DescriptionEn"),
    item2TitleEn: formData.get("item2TitleEn"),
    item2DescriptionEn: formData.get("item2DescriptionEn"),
    item3TitleEn: formData.get("item3TitleEn"),
    item3DescriptionEn: formData.get("item3DescriptionEn"),
    item1TitleAr: formData.get("item1TitleAr"),
    item1DescriptionAr: formData.get("item1DescriptionAr"),
    item2TitleAr: formData.get("item2TitleAr"),
    item2DescriptionAr: formData.get("item2DescriptionAr"),
    item3TitleAr: formData.get("item3TitleAr"),
    item3DescriptionAr: formData.get("item3DescriptionAr"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveWhyUsContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.whyUs);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/why-us`);
  return { success: true };
}
