"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { saveWorkingHoursForWeekday } from "@/services/booking/appointments.service";
import { workingHoursRuleSchema } from "@/lib/validation/appointments.schema";

export type WorkingHoursActionState = {
  error?: "invalidInput";
};

export async function saveWorkingHoursDayAction(
  locale: Locale,
  _prevState: WorkingHoursActionState,
  formData: FormData,
): Promise<WorkingHoursActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const weekday = Number(formData.get("weekday"));
  const isDayOff = formData.get("dayOff") === "on";

  if (isDayOff) {
    await saveWorkingHoursForWeekday(weekday, null);
    revalidatePath(`/${locale}/dashboard/appointments/working-hours`);
    return {};
  }

  const parsed = workingHoursRuleSchema.safeParse({
    weekday,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotLengthMinutes: formData.get("slotLengthMinutes"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  const { startTime, endTime, slotLengthMinutes } = parsed.data;
  await saveWorkingHoursForWeekday(weekday, {
    startTime,
    endTime,
    slotLengthMinutes,
  });
  revalidatePath(`/${locale}/dashboard/appointments/working-hours`);
  return {};
}
