import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { createMedia } from "@/services/media/media.service";
import { isSameOriginRequest } from "@/lib/security";
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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowedUploadType(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (!isWithinUploadSizeLimit(file.size)) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const body = Buffer.from(await file.arrayBuffer());

  const media = await createMedia({
    body,
    contentType: file.type,
    originalName: file.name,
    uploadedById: session.user.id,
  });

  return NextResponse.json(media);
}
