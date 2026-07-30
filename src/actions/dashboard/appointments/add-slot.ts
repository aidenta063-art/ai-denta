"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { addCustomSlot } from "@/services/booking/appointments.service";
import { addSlotSchema } from "@/lib/validation/add-slot.schema";

export type AddSlotActionState = {
  error?: "invalidInput" | "invalidRange" | "overlap";
};

export async function addSlotAction(
  locale: Locale,
  _prevState: AddSlotActionState,
  formData: FormData,
): Promise<AddSlotActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = addSlotSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const result = await addCustomSlot(parsed.data);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath(`/${locale}/dashboard/appointments`);
  return {};
}
