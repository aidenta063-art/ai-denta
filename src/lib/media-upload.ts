export type UploadedMedia = {
  id: string;
  key: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
};

type UploadResult = { media: UploadedMedia } | { error: string };

const CHUNK_CONCURRENCY = 5;

export async function uploadMediaFromBrowser(file: File): Promise<UploadResult> {
  const chunkedResult = await tryChunkedUpload(file);
  if (chunkedResult) return chunkedResult;

  return uploadViaSinglePresign(file);
}

/**
 * Large uploads are bandwidth-bound on a single connection — splitting
 * the file into parts and pushing several over the wire at once (see
 * storage.service.ts's createChunkedMediaUpload) cuts real transfer
 * time for big video files. Returns null when chunking doesn't apply
 * (small file, no cloud provider configured, etc.) so the caller falls
 * back to the plain single-PUT path.
 */
async function tryChunkedUpload(file: File): Promise<UploadResult | null> {
  let initiated: {
    fallback: boolean;
    finalKey?: string;
    partSize?: number;
    parts?: { partNumber: number; key: string; uploadUrl: string }[];
  };

  try {
    const initiateRes = await fetch("/api/dashboard/media/chunked/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
    if (!initiateRes.ok) return null;
    initiated = await initiateRes.json();
  } catch {
    return null;
  }

  if (initiated.fallback || !initiated.finalKey || !initiated.parts) {
    return null;
  }

  const { finalKey, partSize, parts } = initiated as {
    finalKey: string;
    partSize: number;
    parts: { partNumber: number; key: string; uploadUrl: string }[];
  };

  try {
    const queue = [...parts];
    async function worker() {
      let part: (typeof parts)[number] | undefined;
      while ((part = queue.shift())) {
        const start = (part.partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const res = await fetch(part.uploadUrl, {
          method: "PUT",
          body: file.slice(start, end),
        });
        if (!res.ok) {
          throw new Error(`Chunk ${part.partNumber} upload failed`);
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CHUNK_CONCURRENCY, parts.length) }, worker),
    );

    const completeRes = await fetch("/api/dashboard/media/chunked/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalKey,
        partKeys: parts.map((p) => p.key),
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });

    if (!completeRes.ok) {
      const errBody = await completeRes.json().catch(() => null);
      return { error: errBody?.error ?? "Upload failed" };
    }

    return { media: await completeRes.json() };
  } catch (err) {
    console.error(err);
    return { error: "Upload failed — check your connection and try again." };
  }
}

async function uploadViaSinglePresign(file: File): Promise<UploadResult> {
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
