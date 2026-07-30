export type UploadedMedia = {
  id: string;
  key: string;
  url: string;
  type: "IMAGE" | "VIDEO";
};

type UploadResult = { media: UploadedMedia } | { error: string };

export async function uploadMediaFromBrowser(file: File): Promise<UploadResult> {
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
    return { error: body?.error ?? "Upload failed" };
  }

  const presigned = await presignRes.json();
  if (presigned.fallback) {
    // No cloud storage configured (local dev) — fall back to the
    // server-proxied upload route.
    return uploadViaServerProxy(file);
  }

  const putRes = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) {
    return { error: "Upload to storage failed" };
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
    return { error: body?.error ?? "Upload failed" };
  }

  return { media: await confirmRes.json() };
}

async function uploadViaServerProxy(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/dashboard/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { error: body?.error ?? "Upload failed" };
  }

  return { media: await res.json() };
}
