"use client";

import { useState, useTransition } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { MeetingStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: { value: MeetingStatus; label: string }[] = [
  { value: MeetingStatus.PENDING, label: "🟡 Pending" },
  { value: MeetingStatus.CONFIRMED, label: "🔵 Confirmed" },
  { value: MeetingStatus.ATTENDED, label: "🟢 Attended" },
  { value: MeetingStatus.NO_SHOW, label: "🔴 No Show" },
  { value: MeetingStatus.CANCELLED, label: "⚫ Cancelled" },
];

export function MeetingStatusSelect({
  status,
  setStatus,
}: {
  status: MeetingStatus;
  setStatus: (status: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => setStatus(next));
      }}
      aria-label="Meeting status"
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function MeetingNoteEditor({
  clientName,
  note,
  maxLength,
  saveNote,
}: {
  clientName: string;
  note: string | null;
  maxLength: number;
  saveNote: (note: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note ?? "");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    // Re-seed from the saved note each time the dialog opens so an
    // abandoned edit doesn't linger.
    if (next) setDraft(note ?? "");
    setOpen(next);
  }

  function handleSave() {
    startTransition(async () => {
      await saveNote(draft);
      setOpen(false);
    });
  }

  return (
    <div className="flex items-start gap-2">
      <p
        className="line-clamp-2 max-w-56 text-sm whitespace-pre-line text-muted-foreground"
        title={note ?? undefined}
      >
        {note || "—"}
      </p>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              size="sm"
              variant="outline"
              aria-label={`${note ? "Edit" : "Add"} note for ${clientName}`}
            >
              <NotebookPen className="size-3.5" />
              {note ? "Edit" : "Add"}
            </Button>
          }
        />
        <DialogContent className="max-w-lg p-6">
          <h2 className="pe-8 text-lg font-semibold text-popover-foreground">
            Note for {clientName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Private — only staff can see this. It stays with the client across
            meetings.
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={maxLength}
            rows={6}
            autoFocus
            className="mt-4 w-full resize-y rounded-lg border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
