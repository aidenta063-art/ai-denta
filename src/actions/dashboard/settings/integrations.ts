"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveMetaPixelId } from "@/services/content/integrations.service";

export type SaveIntegrationsState = {
  error?: "invalidPixelId";
  success?: boolean;
};

// Meta Pixel IDs are numeric, typically 15-16 digits.
const PIXEL_ID_PATTERN = /^\d{10,20}$/;

export async function saveIntegrationsAction(
  locale: Locale,
  _prevState: SaveIntegrationsState,
  formData: FormData,
): Promise<SaveIntegrationsState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const raw = String(formData.get("metaPixelId") ?? "").trim();
  if (raw && !PIXEL_ID_PATTERN.test(raw)) {
    return { error: "invalidPixelId" };
  }

  await saveMetaPixelId(raw || null, session.user.id);

  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/settings`);

  return { success: true };
}
