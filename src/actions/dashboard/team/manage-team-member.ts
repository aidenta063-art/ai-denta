"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  TEAM_MEMBER_TAGS,
} from "@/services/team/team-member.service";
import { teamMemberFormSchema } from "@/lib/validation/team-member.schema";

export type TeamMemberActionState = {
  error?: "invalidInput";
};

async function revalidateTeamMembers(locale: Locale) {
  updateTag(TEAM_MEMBER_TAGS.active);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/team`);
}

function parseTeamMemberForm(formData: FormData) {
  return teamMemberFormSchema.safeParse({
    nameEn: formData.get("nameEn"),
    nameAr: formData.get("nameAr"),
    sortOrder: formData.get("sortOrder"),
    photoMediaId: formData.get("photoMediaId"),
  });
}

export async function createTeamMemberAction(
  locale: Locale,
  _prevState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await createTeamMember(parsed.data);
  await revalidateTeamMembers(locale);
  return {};
}

export async function updateTeamMemberAction(
  locale: Locale,
  memberId: string,
  _prevState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateTeamMember(memberId, parsed.data);
  await revalidateTeamMembers(locale);
  return {};
}

export async function deleteTeamMemberAction(locale: Locale, memberId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteTeamMember(memberId);
  await revalidateTeamMembers(locale);
}
