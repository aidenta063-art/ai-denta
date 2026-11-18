"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  setOurDoctorsSectionActive,
  CMS_TAGS,
} from "@/services/content/cms.service";

export async function setOurDoctorsSectionActiveAction(
  locale: Locale,
  isActive: boolean,
) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);
  await setOurDoctorsSectionActive(isActive, session.user.id);
  updateTag(CMS_TAGS.ourDoctorsVisibility);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/doctors`);
}
