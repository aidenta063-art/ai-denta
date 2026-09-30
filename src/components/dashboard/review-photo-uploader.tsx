"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

export function ReviewPhotoUploader({
  name,
  photoUrl,
  setAction,
  removeAction,
}: {
  name: string;
  photoUrl: string | null;
  setAction: (mediaId: string) => Promise<void>;
  removeAction: () => Promise<void>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
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
      setError("Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    startTransition(() => {
      removeAction().then(() => router.refresh());
    });
  }

  const busy = isUploading || isPending;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {photoUrl ? (
        <Image
          key={photoUrl}
          src={photoUrl}
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        disabled={busy}
        className="hidden"
        id={`review-photo-${name}`}
      />
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="h-6 px-1.5 text-[11px]"
        >
          {busy ? "…" : photoUrl ? "Change" : "Upload"}
        </Button>
        {photoUrl && !busy && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="h-6 px-1.5 text-[11px]"
          >
            Remove
          </Button>
        )}
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
