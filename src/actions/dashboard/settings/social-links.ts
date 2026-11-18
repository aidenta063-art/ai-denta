"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveSocialLinks } from "@/services/content/integrations.service";

export type SaveSocialLinksState = {
  error?: "invalidUrl";
  success?: boolean;
};

function normalizeUrl(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  return value || null;
}

export async function saveSocialLinksAction(
  locale: Locale,
  _prevState: SaveSocialLinksState,
  formData: FormData,
): Promise<SaveSocialLinksState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const links = {
    facebookUrl: normalizeUrl(formData.get("facebookUrl")),
    instagramUrl: normalizeUrl(formData.get("instagramUrl")),
    tiktokUrl: normalizeUrl(formData.get("tiktokUrl")),
    youtubeUrl: normalizeUrl(formData.get("youtubeUrl")),
  };

  for (const url of Object.values(links)) {
    if (url && !/^https?:\/\/.+/.test(url)) {
      return { error: "invalidUrl" };
    }
  }

  await saveSocialLinks(links, session.user.id);

  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/settings`);

  return { success: true };
}
