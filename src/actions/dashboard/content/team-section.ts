"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveTeamSectionContent, CMS_TAGS } from "@/services/content/cms.service";
import { teamSectionFormSchema } from "@/lib/validation/cms.schema";

export type TeamSectionActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveTeamSectionAction(
  locale: Locale,
  _prevState: TeamSectionActionState,
  formData: FormData,
): Promise<TeamSectionActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = teamSectionFormSchema.safeParse({
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveTeamSectionContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.teamSection);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/team`);
  return { success: true };
}
