"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function uploadViaPresignedUrl(file: File): Promise<string | null> {
  const presignRes = await fetch("/api/dashboard/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => null);
    return body?.error ?? "Upload failed";
  }

  const presigned = await presignRes.json();
  if (presigned.fallback) {
    // No cloud storage configured (local dev) — caller falls back to
    // the server-proxied upload route.
    return "FALLBACK";
  }

  const putRes = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) {
    return "Upload to storage failed";
  }

  const confirmRes = await fetch("/api/dashboard/media/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: presigned.key,
      publicUrl: presigned.publicUrl,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });
  if (!confirmRes.ok) {
    const body = await confirmRes.json().catch(() => null);
    return body?.error ?? "Upload failed";
  }

  return null;
}

async function uploadViaServerProxy(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/dashboard/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return body?.error ?? "Upload failed";
  }

  return null;
}

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
      let result = await uploadViaPresignedUrl(file);
      if (result === "FALLBACK") {
        result = await uploadViaServerProxy(file);
      }

      if (result) {
        setError(result);
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
