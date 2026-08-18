"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validation/auth.schema";
import type { Locale } from "@/i18n/routing";

export type UpdateProfileActionState = {
  error?: "invalidInput" | "unauthenticated";
  success?: boolean;
};

export async function updateProfileAction(
  locale: Locale,
  _prevState: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "unauthenticated" };
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath(`/${locale}/account`);
  return { success: true };
}
