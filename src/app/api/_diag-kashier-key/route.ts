import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reports only non-sensitive metadata about
// the loaded KASHIER_SECRET_KEY (never the value itself), to confirm
// production's env var is formatted correctly. Delete after use.
export async function GET() {
  const key = process.env.KASHIER_SECRET_KEY ?? "";
  return NextResponse.json({
    length: key.length,
    containsBackslash: key.includes("\\"),
    containsDollar: key.includes("$"),
    first6: key.slice(0, 6),
    last6: key.slice(-6),
  });
}
