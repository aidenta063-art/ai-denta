"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { deleteUser } from "@/services/users/user.service";

export async function deleteUserAction(locale: Locale, userId: string) {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  if (session.user.id === userId) {
    return;
  }

  await deleteUser(userId);
  revalidatePath(`/${locale}/dashboard/users`);
}
