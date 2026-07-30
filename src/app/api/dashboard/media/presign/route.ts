import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { isSameOriginRequest } from "@/lib/security";
import {
  createPresignedMediaUpload,
  isAllowedUploadType,
  isWithinUploadSizeLimit,
} from "@/services/storage/storage.service";

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
  const filename = body?.filename;
  const contentType = body?.contentType;
  const sizeBytes = Number(body?.sizeBytes);

  if (
    typeof filename !== "string" ||
    typeof contentType !== "string" ||
    !Number.isFinite(sizeBytes)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isAllowedUploadType(contentType)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (!isWithinUploadSizeLimit(sizeBytes)) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const presigned = await createPresignedMediaUpload({
    originalName: filename,
    contentType,
  });

  if (!presigned) {
    // No cloud provider configured (local dev) — client falls back to
    // the server-proxied /api/dashboard/media/upload route.
    return NextResponse.json({ fallback: true });
  }

  return NextResponse.json({
    fallback: false,
    key: presigned.key,
    uploadUrl: presigned.uploadUrl,
    publicUrl: presigned.publicUrl,
  });
}
