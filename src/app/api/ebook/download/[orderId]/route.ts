import { NextResponse } from "next/server";
import { EbookOrderStatus, Role } from "@/generated/prisma/enums";
import { PATIENT_FLOW_EBOOK } from "@/lib/ebook";
import { getEbookOrder } from "@/services/ebook/ebook.service";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const order = await getEbookOrder(orderId);

  if (!order || order.status !== EbookOrderStatus.PAID) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const isOwner = order.userId !== null && session?.user?.id === order.userId;
  const isStaff =
    session?.user?.role === Role.ADMIN || session?.user?.role === Role.STAFF;

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(PATIENT_FLOW_EBOOK.fileUrl);
}
