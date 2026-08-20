import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reports only non-sensitive metadata about
// the loaded KASHIER_SECRET_KEY (never the value itself), to confirm
// production's env var is formatted correctly. Delete after use.
export async function GET() {
  const part1 = process.env.KASHIER_SECRET_KEY_PART1 ?? "";
  const part2 = process.env.KASHIER_SECRET_KEY_PART2 ?? "";
  const joined = part1 && part2 ? `${part1}$${part2}` : "";
  return NextResponse.json({
    part1Length: part1.length,
    part2Length: part2.length,
    part1ContainsDollar: part1.includes("$"),
    part2ContainsDollar: part2.includes("$"),
    joinedLength: joined.length,
    joinedFirst6: joined.slice(0, 6),
    joinedLast6: joined.slice(-6),
  });
}
