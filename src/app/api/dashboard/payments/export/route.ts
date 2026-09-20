import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import {
  paymentsToCsv,
  parsePaymentFilters,
} from "@/services/payments/payments-admin.service";

export async function GET(request: Request) {
  const session = await auth();

  const allowedRoles: Role[] = [Role.ADMIN, Role.STAFF];

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const csv = await paymentsToCsv(
    parsePaymentFilters(Object.fromEntries(searchParams)),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
