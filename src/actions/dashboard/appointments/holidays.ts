"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  addHoliday,
  deleteHoliday,
  deleteHolidayByDate,
} from "@/services/booking/appointments.service";
import { holidaySchema } from "@/lib/validation/appointments.schema";

export type HolidayActionState = {
  error?: "invalidInput";
};

export async function addHolidayAction(
  locale: Locale,
  _prevState: HolidayActionState,
  formData: FormData,
): Promise<HolidayActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = holidaySchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await addHoliday(parsed.data);
  revalidatePath(`/${locale}/dashboard/appointments`);
  revalidatePath(`/${locale}/dashboard/appointments/holidays`);
  return {};
}

export async function deleteHolidayAction(locale: Locale, holidayId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteHoliday(holidayId);
  revalidatePath(`/${locale}/dashboard/appointments`);
  revalidatePath(`/${locale}/dashboard/appointments/holidays`);
}

export async function markDayHolidayAction(locale: Locale, date: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await addHoliday({ date, reason: "" });
  revalidatePath(`/${locale}/dashboard/appointments`);
  revalidatePath(`/${locale}/dashboard/appointments/holidays`);
}

export async function unmarkDayHolidayAction(locale: Locale, date: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteHolidayByDate(date);
  revalidatePath(`/${locale}/dashboard/appointments`);
  revalidatePath(`/${locale}/dashboard/appointments/holidays`);
}
