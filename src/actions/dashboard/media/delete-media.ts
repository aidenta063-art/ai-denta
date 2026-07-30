"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { deleteMedia } from "@/services/media/media.service";

export async function deleteMediaAction(
  locale: Locale,
  mediaId: string,
): Promise<void> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  try {
    await deleteMedia(mediaId);
  } catch {
    // Referenced by a Service icon or a CMS section — leave it in place.
    return;
  }

  revalidatePath(`/${locale}/dashboard/content/media`);
}
