import { prisma } from "@/lib/prisma";
import { BookingStatus, MeetingStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export const MEETING_FILTERS = [
  "all",
  "upcoming",
  "pending",
  "confirmed",
  "attended",
  "no-show",
  "cancelled",
] as const;
export type MeetingFilter = (typeof MEETING_FILTERS)[number];

export const MAX_NOTE_LENGTH = 2000;

export function parseMeetingFilter(value: string | undefined): MeetingFilter {
  return MEETING_FILTERS.find((f) => f === value) ?? "all";
}

// Only scheduled (slotted) consultations are meetings — free requests are a
// waitlist with no time, and unpaid holds aren't real meetings yet. A
// booking cancelled at the booking level still shows up, as Cancelled.
const MEETING_BASE: Prisma.BookingWhereInput = {
  slotId: { not: null },
  status: { in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED] },
};

function filterWhere(filter: MeetingFilter): Prisma.BookingWhereInput {
  const active = { status: BookingStatus.CONFIRMED };
  switch (filter) {
    case "upcoming":
      // Still to happen: not yet attended/no-show/cancelled and in the future.
      return {
        ...MEETING_BASE,
        ...active,
        meetingStatus: {
          in: [MeetingStatus.PENDING, MeetingStatus.CONFIRMED],
        },
        slot: { startAt: { gte: new Date() } },
      };
    case "pending":
      return { ...MEETING_BASE, ...active, meetingStatus: MeetingStatus.PENDING };
    case "confirmed":
      return {
        ...MEETING_BASE,
        ...active,
        meetingStatus: MeetingStatus.CONFIRMED,
      };
    case "attended":
      return {
        ...MEETING_BASE,
        status: BookingStatus.CONFIRMED,
        meetingStatus: MeetingStatus.ATTENDED,
      };
    case "no-show":
      return {
        ...MEETING_BASE,
        status: BookingStatus.CONFIRMED,
        meetingStatus: MeetingStatus.NO_SHOW,
      };
    case "cancelled":
      return {
        ...MEETING_BASE,
        OR: [
          { status: BookingStatus.CANCELLED },
          { meetingStatus: MeetingStatus.CANCELLED },
        ],
      };
    default:
      return MEETING_BASE;
  }
}

export async function listMeetings(filter: MeetingFilter) {
  return prisma.booking.findMany({
    where: filterWhere(filter),
    orderBy: { slot: { startAt: filter === "upcoming" ? "asc" : "desc" } },
    include: { slot: true, user: true, consultationType: true },
  });
}

export function effectiveMeetingStatus(booking: {
  status: BookingStatus;
  meetingStatus: MeetingStatus;
}): MeetingStatus {
  return booking.status === BookingStatus.CANCELLED
    ? MeetingStatus.CANCELLED
    : booking.meetingStatus;
}

/** The note shown beside a client: their account-level note when they have
 * an account (shared across all their bookings), else the booking's own. */
export function meetingNote(booking: {
  notes: string | null;
  user: { adminNote: string | null } | null;
}) {
  return booking.user ? booking.user.adminNote : booking.notes;
}

export async function setMeetingStatus(bookingId: string, status: MeetingStatus) {
  await prisma.booking.updateMany({
    where: { id: bookingId, ...MEETING_BASE },
    data: { meetingStatus: status },
  });
}

export async function saveMeetingNote(bookingId: string, note: string | null) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true },
  });
  if (!booking) return;

  if (booking.userId) {
    await prisma.user.update({
      where: { id: booking.userId },
      data: { adminNote: note },
    });
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { notes: note },
    });
  }
}
