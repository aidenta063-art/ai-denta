"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { MeetingStatus, Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  MAX_NOTE_LENGTH,
  saveMeetingNote,
  setMeetingStatus,
} from "@/services/booking/meetings.service";

export async function setMeetingStatusAction(
  locale: Locale,
  bookingId: string,
  status: string,
) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  if (!Object.values(MeetingStatus).includes(status as MeetingStatus)) return;

  await setMeetingStatus(bookingId, status as MeetingStatus);
  revalidatePath(`/${locale}/dashboard/meetings`);
}

export async function saveMeetingNoteAction(
  locale: Locale,
  bookingId: string,
  note: string,
) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const trimmed = note.trim().slice(0, MAX_NOTE_LENGTH);
  await saveMeetingNote(bookingId, trimmed || null);
  revalidatePath(`/${locale}/dashboard/meetings`);
}
