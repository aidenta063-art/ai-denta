"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  blockSlot,
  unblockSlot,
  deleteSlot,
} from "@/services/booking/appointments.service";

async function revalidateAppointments(locale: Locale) {
  revalidatePath(`/${locale}/dashboard/appointments`);
}

export async function blockSlotAction(locale: Locale, slotId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await blockSlot(slotId);
  await revalidateAppointments(locale);
}

export async function unblockSlotAction(locale: Locale, slotId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await unblockSlot(slotId);
  await revalidateAppointments(locale);
}

export async function deleteSlotAction(locale: Locale, slotId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteSlot(slotId);
  await revalidateAppointments(locale);
}
