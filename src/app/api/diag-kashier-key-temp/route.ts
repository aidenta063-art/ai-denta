import { NextResponse } from "next/server";
import { createKashierSession } from "@/lib/kashier";

// TEMPORARY diagnostic route — attempts a real Kashier session creation
// from inside the actual Vercel runtime using the actual credentials,
// and reports back the raw status/body (never the secret itself).
// Delete after use.
export async function GET() {
  const part1 = process.env.KASHIER_SECRET_KEY_PART1 ?? "";
  const part2 = process.env.KASHIER_SECRET_KEY_PART2 ?? "";
  const joined = part1 && part2 ? `${part1}$${part2}` : "";

  try {
    const session = await createKashierSession({
      merchantOrderId: "diag-route-" + Date.now(),
      amountCents: 100,
      currency: "EGP",
      redirectUrl: "https://ai-denta.com/en/booking/paid/pending/test",
      webhookUrl: "https://ai-denta.com/api/kashier/webhook",
    });
    return NextResponse.json({
      keyLength: joined.length,
      result: "success",
      sessionUrl: session.sessionUrl,
    });
  } catch (error) {
    return NextResponse.json({
      keyLength: joined.length,
      result: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
