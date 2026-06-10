import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? undefined;

  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { id: true, label: true, slug: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, email, phone, company, subject, message, type } = body;

  if (!fullName?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "fullName and email are required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      userId: session.user.id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? "",
      company: company?.trim() ?? "",
      subject: subject?.trim() ?? "",
      message: message?.trim() ?? "",
      type: type ?? "Contact",
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
