import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSameOriginRequest } from "@/lib/security";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "av_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { allowed } = await checkActionRateLimit("track-pageview", {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 500) : null;
  const locale = typeof body?.locale === "string" ? body.locale.slice(0, 5) : "en";

  if (!path) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value ?? crypto.randomUUID();

  await prisma.pageView.create({ data: { path, locale, visitorId } });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    maxAge: VISITOR_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
