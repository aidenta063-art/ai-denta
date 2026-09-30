"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

export function ReviewImagesUploader({
  images,
  addAction,
  removeAction,
}: {
  images: { id: string; url: string }[];
  addAction: (mediaId: string) => Promise<void>;
  removeAction: (mediaId: string) => Promise<void>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                disabled={busy && removingId === image.id}
                aria-label="Remove image"
                className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
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
    </div>
  );
}
