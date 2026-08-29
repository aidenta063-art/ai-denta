"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

export function PdfUploader({
  files,
  maxFiles,
  addAction,
  removeAction,
}: {
  files: { id: string; url: string }[];
  maxFiles: number;
  addAction: (mediaId: string) => Promise<void>;
  removeAction: (mediaId: string) => Promise<void>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const atLimit = files.length >= maxFiles;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadMediaFromBrowser(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      startTransition(() => {
        addAction(result.media.id).then(() => router.refresh());
      });
    } catch (err) {
      console.error(err);
      setError("Upload failed — check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove(mediaId: string) {
    setRemovingId(mediaId);
    startTransition(() => {
      removeAction(mediaId)
        .then(() => router.refresh())
        .finally(() => setRemovingId(null));
    });
  }

  const busy = isUploading || isPending;

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, i) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                <FileText className="size-4 shrink-0" />
                <span className="truncate">PDF {i + 1}</span>
              </a>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy && removingId === file.id}
                onClick={() => handleRemove(file.id)}
              >
                {removingId === file.id ? "Removing…" : "Remove"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {atLimit ? (
        <p className="text-sm text-muted-foreground">
          Maximum of {maxFiles} PDFs reached. Remove one to add another.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            disabled={busy}
            className="text-sm"
          />
          {busy && !removingId && (
            <Button size="sm" disabled>
              {isUploading ? "Uploading…" : "Saving…"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
