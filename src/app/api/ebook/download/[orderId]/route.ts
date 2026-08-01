import { NextResponse } from "next/server";
import { EbookOrderStatus } from "@/generated/prisma/enums";
import { PATIENT_FLOW_EBOOK } from "@/lib/ebook";
import { getEbookOrder } from "@/services/ebook/ebook.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const order = await getEbookOrder(orderId);

  if (!order || order.status !== EbookOrderStatus.PAID) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(PATIENT_FLOW_EBOOK.fileUrl);
}
