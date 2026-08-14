import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isValidUsername } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  _count: { select: { orders: true, profiles: true, leads: true, referrals: true } },
} as const;

// List every registered user (search/filter is done client-side in the admin UI).
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: USER_SELECT,
  });

  return NextResponse.json(users);
}

// Create a new user from the admin console (same rules as the signup form).
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username ?? "").trim();
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "Username, email, and password are required." },
      { status: 400 }
    );
  }

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters and contain only letters, numbers, or underscores." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  if (existingEmail) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  if (existingUsername) {
    return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: USER_SELECT,
  });

  return NextResponse.json(user, { status: 201 });
}
