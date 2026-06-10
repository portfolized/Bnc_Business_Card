import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { lookupKhaltiPayment, isKhaltiConfigured } from "@/lib/khalti";

// Verifies a Khalti payment by pidx and, when Completed, places the order
// (DRAFT -> PENDING, paymentStatus PAID).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pidx } = await req.json().catch(() => ({}));
  if (!pidx) return NextResponse.json({ error: "pidx is required" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { pidx, userId: session.user.id },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Already finalized.
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, status: "Completed", orderId: order.id });
  }

  // Mock payment (no Khalti key configured): complete it directly.
  if (!isKhaltiConfigured() && pidx.startsWith("MOCK-")) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PENDING", paymentStatus: "PAID", transactionId: `MOCK-TXN-${Date.now()}` },
    });
    return NextResponse.json({ ok: true, status: "Completed", orderId: order.id, mock: true });
  }

  let lookup;
  try {
    lookup = await lookupKhaltiPayment(pidx);
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Verification failed." }, { status: 502 });
  }

  if (lookup.status === "Completed") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PENDING", paymentStatus: "PAID", transactionId: lookup.transaction_id ?? null },
    });
    return NextResponse.json({ ok: true, status: "Completed", orderId: order.id });
  }

  return NextResponse.json({ ok: false, status: lookup.status, orderId: order.id });
}
