import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TeamMemberFormInput } from "@/lib/validation/team-member.schema";

const CACHE_SECONDS = 60;
export const TEAM_MEMBER_TAGS = {
  active: "team-members:active",
} as const;

export const listActiveTeamMembers = nextCache(
  async () =>
    prisma.teamMember.findMany({
      where: { isActive: true },
      include: { photoMedia: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["team-members-active"],
  { tags: [TEAM_MEMBER_TAGS.active], revalidate: CACHE_SECONDS },
);

/** Admin listing — includes inactive members, no cache (always fresh in the dashboard). */
export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    include: { photoMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createTeamMember(input: TeamMemberFormInput) {
  const { photoMediaId, ...rest } = input;
  return prisma.teamMember.create({
    data: { ...rest, photoMediaId: photoMediaId ?? null },
  });
}

export async function updateTeamMember(id: string, input: TeamMemberFormInput) {
  const { photoMediaId, ...rest } = input;
  await prisma.teamMember.update({
    where: { id },
    data: { ...rest, photoMediaId: photoMediaId ?? null },
  });
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
}
