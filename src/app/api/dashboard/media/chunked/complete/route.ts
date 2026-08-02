import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { isSameOriginRequest } from "@/lib/security";
import { recordMedia } from "@/services/media/media.service";
import {
  completeChunkedMediaUpload,
  isAllowedUploadType,
  isWithinUploadSizeLimit,
} from "@/services/storage/storage.service";

// Server-side part copying is fast (Cloudflare-internal), but a very
// large file can still mean dozens of parts — give it real headroom.
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  const allowedRoles: Role[] = [Role.ADMIN, Role.STAFF];

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const finalKey = body?.finalKey;
  const contentType = body?.contentType;
  const sizeBytes = Number(body?.sizeBytes);
  const partKeys = body?.partKeys;

  if (
    typeof finalKey !== "string" ||
    typeof contentType !== "string" ||
    !Number.isFinite(sizeBytes) ||
    !Array.isArray(partKeys) ||
    partKeys.length === 0 ||
    !partKeys.every((k) => typeof k === "string")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !isAllowedUploadType(contentType) ||
    !isWithinUploadSizeLimit(sizeBytes)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const completed = await completeChunkedMediaUpload({
    finalKey,
    contentType,
    partKeys,
  });

  if (!completed) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const media = await recordMedia({
    key: finalKey,
    publicUrl: completed.url,
    contentType,
    sizeBytes,
    uploadedById: session.user.id,
  });

  return NextResponse.json(media);
}
