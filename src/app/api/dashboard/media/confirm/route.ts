import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { isSameOriginRequest } from "@/lib/security";
import { recordMedia } from "@/services/media/media.service";
import {
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
  const key = body?.key;
  const publicUrl = body?.publicUrl;
  const contentType = body?.contentType;
  const sizeBytes = Number(body?.sizeBytes);

  if (
    typeof key !== "string" ||
    typeof publicUrl !== "string" ||
    typeof contentType !== "string" ||
    !Number.isFinite(sizeBytes) ||
    !isAllowedUploadType(contentType) ||
    !isWithinUploadSizeLimit(sizeBytes)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const media = await recordMedia({
    key,
    publicUrl,
    contentType,
    sizeBytes,
    uploadedById: session.user.id,
  });

  return NextResponse.json(media);
}
