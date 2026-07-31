import { NextResponse } from "next/server";
import { generateSlots } from "@/services/booking/slot-generation";

const HORIZON_DAYS = 14;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { created } = await generateSlots({ horizonDays: HORIZON_DAYS });
  return NextResponse.json({ created });
}
