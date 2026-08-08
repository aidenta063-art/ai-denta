import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/** Meta's one-time handshake when you save the Callback URL + Verify Token
 * in the WhatsApp app dashboard: it GETs this URL with a challenge string,
 * and expects it echoed back verbatim — but only if our token matches,
 * proving we're the ones who configured the webhook. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Meta POSTs message status updates (sent/delivered/read/failed) and any
 * inbound replies here. Just logging for now — nothing in the app reads
 * these yet, but Meta requires the endpoint to accept POSTs once the
 * webhook is subscribed, and this keeps a record if something needs
 * investigating later (e.g. a template message failing to deliver). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  logger.info({ body }, "WhatsApp webhook event received");
  return NextResponse.json({ ok: true });
}
