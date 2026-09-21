import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  MEETING_FILTERS,
  MAX_NOTE_LENGTH,
  effectiveMeetingStatus,
  listMeetings,
  meetingNote,
  parseMeetingFilter,
  type MeetingFilter,
} from "@/services/booking/meetings.service";
import {
  saveMeetingNoteAction,
  setMeetingStatusAction,
} from "@/actions/dashboard/meetings";
import {
  MeetingNoteEditor,
  MeetingStatusSelect,
} from "@/components/dashboard/meeting-controls";
import { formatSlotTimeRange } from "@/lib/timezone";

const FILTER_LABELS: Record<MeetingFilter, string> = {
  all: "All",
  upcoming: "Upcoming",
  pending: "Pending",
  confirmed: "Confirmed",
  attended: "Attended",
  "no-show": "No Show",
  cancelled: "Cancelled",
};

const EMPTY_MESSAGES: Record<MeetingFilter, string> = {
  all: "No meetings yet.",
  upcoming: "No upcoming meetings.",
  pending: "No pending meetings.",
  confirmed: "No confirmed meetings.",
  attended: "No attended meetings yet.",
  "no-show": "No no-shows — nobody needs follow-up.",
  cancelled: "No cancelled meetings.",
};

export default async function MeetingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const filter = parseMeetingFilter((await searchParams).filter);
  const meetings = await listMeetings(filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Meetings</h1>
        <p className="text-sm text-muted-foreground">
          Scheduled consultations — track who attended, who didn&apos;t, and
          keep notes on each client.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MEETING_FILTERS.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={option === filter ? "default" : "outline"}
            render={
              <Link
                href={
                  option === "all"
                    ? "/dashboard/meetings"
                    : { pathname: "/dashboard/meetings", query: { filter: option } }
                }
                locale={locale}
              />
            }
          >
            {FILTER_LABELS[option]}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Client</th>
              <th className="px-4 py-2 text-start">Phone</th>
              <th className="px-4 py-2 text-start">Appointment</th>
              <th className="px-4 py-2 text-start">Status</th>
              <th className="px-4 py-2 text-start">Note</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  {EMPTY_MESSAGES[filter]}
                </td>
              </tr>
            )}
            {meetings.map((meeting) => {
              const name = meeting.user?.name ?? meeting.guestName ?? "Guest";
              const phone = meeting.guestPhone ?? meeting.user?.phone;
              const setStatus = setMeetingStatusAction.bind(
                null,
                locale,
                meeting.id,
              );
              const saveNote = saveMeetingNoteAction.bind(
                null,
                locale,
                meeting.id,
              );

              return (
                <tr
                  key={meeting.id}
                  className="border-t border-border align-top transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-medium text-card-foreground">
                    {name}
                    <div className="text-xs font-normal text-muted-foreground">
                      {meeting.user?.email ?? meeting.guestEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-card-foreground">
                    {meeting.slot
                      ? formatSlotTimeRange(
                          meeting.slot.startAt,
                          meeting.slot.endAt,
                          "en",
                          { dateStyle: "medium" },
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <MeetingStatusSelect
                      status={effectiveMeetingStatus(meeting)}
                      setStatus={setStatus}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <MeetingNoteEditor
                      clientName={name}
                      note={meetingNote(meeting)}
                      maxLength={MAX_NOTE_LENGTH}
                      saveNote={saveNote}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
