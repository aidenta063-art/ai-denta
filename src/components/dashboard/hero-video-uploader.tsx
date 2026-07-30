"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

export function HeroVideoUploader({
  currentVideoUrl,
  setAction,
  clearAction,
}: {
  currentVideoUrl: string | null;
  setAction: (mediaId: string) => Promise<void>;
  clearAction: () => Promise<void>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
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
        setAction(result.media.id).then(() => router.refresh());
      });
    } catch (err) {
      console.error(err);
      setError("Upload failed — check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    startTransition(() => {
      clearAction().then(() => router.refresh());
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

      {currentVideoUrl && (
        <video
          key={currentVideoUrl}
          src={currentVideoUrl}
          controls
          muted
          className="aspect-video w-full max-w-sm rounded-xl border border-border bg-black object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleChange}
          disabled={busy}
          className="text-sm"
        />
        {busy && (
          <Button size="sm" disabled>
            {isUploading ? "Uploading…" : "Saving…"}
          </Button>
        )}
        {currentVideoUrl && !busy && (
          <Button size="sm" variant="destructive" onClick={handleRemove}>
            Remove video
          </Button>
        )}
      </div>
    </div>
  );
}
