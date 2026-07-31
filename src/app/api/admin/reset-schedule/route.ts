import { NextResponse } from "next/server";
import { resetBookingSchedule } from "@/services/booking/reset-schedule";

// One-off migration endpoint — remove after use. Protected by the same
// bearer secret as the cron route since it's just as sensitive.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await resetBookingSchedule();
  return NextResponse.json(result);
}
