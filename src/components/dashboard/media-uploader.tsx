"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadMediaFromBrowser(file);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch (err) {
      // A thrown error (network failure, CORS rejection, etc.) would
      // otherwise leave the "Uploading…" state just vanishing with no
      // explanation — always surface something to the admin.
      console.error(err);
      setError(
        "Upload failed — check your connection and try again. If this keeps happening, the storage bucket's CORS settings may need updating.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={handleChange}
          disabled={isUploading}
          className="text-sm"
        />
        {isUploading && (
          <Button size="sm" disabled>
            Uploading…
          </Button>
        )}
      </div>
    </div>
  );
}
