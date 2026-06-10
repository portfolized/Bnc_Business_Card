import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const profiles = await prisma.profile.findMany({
    orderBy: { views: "desc" },
    take: 20,
    select: {
      id: true,
      label: true,
      views: true,
      user: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  const data = profiles.map((p, i) => ({
    rank: i + 1,
    profileId: p.id,
    cardLabel: p.label,
    views: p.views,
    username: p.user.username,
    name: p.user.name,
  }));

  return NextResponse.json(data);
}
